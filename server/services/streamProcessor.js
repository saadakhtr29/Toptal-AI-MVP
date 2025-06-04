const { Transform } = require("stream");
const speechToText = require("./speechToText");
const geminiService = require("./geminiService");
const textToSpeech = require("./textToSpeech");
const conversationMemory = require("../utils/conversationMemory");
const websocketService = require("./websocketService");

class StreamProcessor {
  constructor() {
    this.activeStreams = new Map();
    this.bufferSize = 4096;
    this.sampleRate = 16000;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.streamTimeout = 300000; // 5 minutes
  }

  // Process incoming audio stream
  async processStream(streamId, audioStream, sessionId, options = {}) {
    try {
      console.log(`Starting stream processing for call ${streamId}`);

      if (!audioStream || typeof audioStream.pipe !== "function") {
        throw new Error("Invalid audio stream provided");
      }

      // Initialize stream processing
      const streamContext = {
        streamId,
        sessionId,
        startTime: Date.now(),
        buffer: Buffer.alloc(0),
        isProcessing: true,
        options,
        retryCount: 0,
        audioStream,
        transformStream: null,
        transcriptionStream: null,
      };

      this.activeStreams.set(streamId, streamContext);

      // Create transform stream for audio processing
      const transformStream = new Transform({
        transform: (chunk, encoding, callback) => {
          try {
            // Process the audio chunk
            this.processAudioChunk(streamId, chunk)
              .then(() => callback())
              .catch((error) => {
                console.error("Error in transform stream:", error);
                this.handleStreamError(streamId, error);
                callback(error);
              });
          } catch (error) {
            console.error("Error in transform stream:", error);
            this.handleStreamError(streamId, error);
            callback(error);
          }
        },
      });

      streamContext.transformStream = transformStream;

      // Set up transcription stream with retry logic
      await this.setupTranscriptionStream(streamId, transformStream);

      // Set up stream timeout
      this.setupStreamTimeout(streamId);

      // Handle stream errors
      transformStream.on("error", (error) => {
        console.error("Transform Stream Error:", error);
        this.handleStreamError(streamId, error);
      });

      // Pipe audio stream to transform stream
      audioStream.pipe(transformStream);

      return streamContext;
    } catch (error) {
      console.error("Stream Processing Error:", error);
      throw new Error(`Failed to process audio stream: ${error.message}`);
    }
  }

  // Setup stream timeout
  setupStreamTimeout(streamId) {
    const context = this.activeStreams.get(streamId);
    if (!context) return;

    context.timeoutId = setTimeout(() => {
      console.log(`Stream timeout reached for call ${streamId}`);
      this.handleStreamError(streamId, new Error("Stream timeout reached"));
    }, this.streamTimeout);
  }

  // Setup transcription stream with retry logic
  async setupTranscriptionStream(streamId, transformStream) {
    const context = this.activeStreams.get(streamId);
    if (!context) {
      throw new Error("Stream context not found");
    }

    try {
      if (!transformStream || typeof transformStream.pipe !== "function") {
        throw new Error("Invalid transform stream");
      }

      const transcriptionStream = await speechToText.startRealtimeTranscription(
        transformStream,
        async (error, result) => {
          if (error) {
            console.error("Transcription Error:", error);
            this.handleStreamError(streamId, error);
            return;
          }

          if (result && result.isFinal) {
            await this.handleTranscription(streamId, result);
          }
        }
      );

      transcriptionStream.on("error", (error) => {
        console.error("Transcription Stream Error:", error);
        this.handleStreamError(streamId, error);
      });

      context.transcriptionStream = transcriptionStream;
    } catch (error) {
      console.error("Error setting up transcription stream:", error);
      this.handleStreamError(streamId, error);
    }
  }

  // Handle stream errors with retry logic
  async handleStreamError(streamId, error) {
    const context = this.activeStreams.get(streamId);
    if (!context) return;

    // Clear timeout if exists
    if (context.timeoutId) {
      clearTimeout(context.timeoutId);
    }

    // Check if it's a timeout error
    const isTimeout = error.code === 2 && error.details?.includes("408");

    if (isTimeout && context.retryCount < this.maxRetries) {
      console.log(
        `Retrying stream for call ${streamId}, attempt ${
          context.retryCount + 1
        }`
      );
      context.retryCount++;

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, this.retryDelay * context.retryCount)
      );

      try {
        // Clean up existing stream
        if (context.transcriptionStream) {
          context.transcriptionStream.end();
        }

        // Retry setup
        await this.setupTranscriptionStream(streamId, context.transformStream);

        // Reset timeout
        this.setupStreamTimeout(streamId);
      } catch (retryError) {
        console.error(`Retry failed for call ${streamId}:`, retryError);
        this.stopStream(streamId);
      }
    } else {
      // Max retries reached or non-timeout error
      console.error(`Stream error for call ${streamId}:`, error);
      this.stopStream(streamId);
    }
  }

  // Process audio chunk
  async processAudioChunk(streamId, chunk) {
    try {
      const context = this.activeStreams.get(streamId);
      if (!context) {
        throw new Error("Stream context not found");
      }

      // Append chunk to buffer
      context.buffer = Buffer.concat([context.buffer, chunk]);

      // Process buffer if it's large enough
      if (context.buffer.length >= this.bufferSize) {
        const audioData = context.buffer.slice(0, this.bufferSize);
        context.buffer = context.buffer.slice(this.bufferSize);

        // Send audio data to transcription service
        await speechToText.processAudioChunk(streamId, audioData);
      }
    } catch (error) {
      console.error("Audio Chunk Processing Error:", error);
      throw error;
    }
  }

  // Process audio buffer
  processBuffer(buffer) {
    // Add any necessary audio processing here
    // For example, noise reduction, volume normalization, etc.
    return buffer;
  }

  // Handle transcription result
  async handleTranscription(streamId, result) {
    try {
      const context = this.activeStreams.get(streamId);
      if (!context) {
        throw new Error("Stream context not found");
      }

      console.log(
        `Received transcription for call ${streamId}: ${result.transcript}`
      );

      // Add transcription to conversation memory
      conversationMemory.addMessage(context.sessionId, {
        role: "user",
        content: result.transcript,
        timestamp: Date.now(),
      });

      // Generate AI response
      const response = await geminiService.generateResponse(
        context.sessionId,
        result.transcript
      );

      // Synthesize response to speech
      const audioContent = await textToSpeech.synthesize(response.text, {
        voice: context.options.voice,
        audioConfig: context.options.audioConfig,
      });

      // Broadcast transcription and response
      websocketService.sendToClient(context.sessionId, {
        type: "transcription",
        data: {
          transcript: result.transcript,
          confidence: result.confidence,
          timestamp: Date.now(),
        },
      });

      websocketService.sendToClient(context.sessionId, {
        type: "response",
        data: {
          text: response.text,
          audio: audioContent.toString("base64"),
          timestamp: Date.now(),
        },
      });

      return audioContent;
    } catch (error) {
      console.error("Transcription Handling Error:", error);
      websocketService.sendError(streamId, "Failed to handle transcription");
      throw error;
    }
  }

  // Stop stream processing
  async stopStream(streamId) {
    try {
      const context = this.activeStreams.get(streamId);
      if (!context) {
        console.warn(
          `No stream context found for ${streamId} - stream may have already been stopped`
        );
        return null;
      }

      console.log(`Stopping stream processing for call ${streamId}`);

      // Clear timeout if exists
      if (context.timeoutId) {
        clearTimeout(context.timeoutId);
      }

      // Clean up streams
      if (context.transcriptionStream) {
        context.transcriptionStream.end();
      }
      if (context.transformStream) {
        context.transformStream.end();
      }
      if (
        context.audioStream &&
        typeof context.audioStream.end === "function"
      ) {
        context.audioStream.end();
      } else if (
        context.audioStream &&
        typeof context.audioStream.destroy === "function"
      ) {
        context.audioStream.destroy();
      }

      // End conversation if session exists
      try {
        const summary = await conversationMemory.endConversation(
          context.sessionId
        );
        context.isProcessing = false;
        this.activeStreams.delete(streamId);
        return summary;
      } catch (error) {
        console.warn(`Error ending conversation for ${streamId}:`, error);
        context.isProcessing = false;
        this.activeStreams.delete(streamId);
        return null;
      }
    } catch (error) {
      console.error("Stream Stop Error:", error);
      return null;
    }
  }

  // Get stream status
  getStreamStatus(streamId) {
    const context = this.activeStreams.get(streamId);
    if (!context) {
      return null;
    }

    return {
      streamId: context.streamId,
      sessionId: context.sessionId,
      isProcessing: context.isProcessing,
      startTime: context.startTime,
      duration: Date.now() - context.startTime,
    };
  }
}

// Export a singleton instance
module.exports = new StreamProcessor();
