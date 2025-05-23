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
  }

  // Process incoming audio stream
  async processStream(streamId, audioStream, sessionId, options = {}) {
    try {
      // Initialize stream processing
      const streamContext = {
        streamId,
        sessionId,
        startTime: Date.now(),
        buffer: Buffer.alloc(0),
        isProcessing: true,
        options,
      };

      this.activeStreams.set(streamId, streamContext);

      // Create transform stream for audio processing
      const transformStream = new Transform({
        transform: (chunk, encoding, callback) => {
          this.processAudioChunk(streamId, chunk, callback);
        },
      });

      // Set up transcription stream
      const transcriptionStream = await speechToText.startRealtimeTranscription(
        transformStream,
        async (error, result) => {
          if (error) {
            console.error("Transcription Error:", error);
            return;
          }

          if (result.isFinal) {
            await this.handleTranscription(streamId, result);
          }
        }
      );

      // Pipe audio stream through processing pipeline
      audioStream.pipe(transformStream).pipe(transcriptionStream);

      return streamContext;
    } catch (error) {
      console.error("Stream Processing Error:", error);
      throw new Error("Failed to process audio stream");
    }
  }

  // Process audio chunk
  async processAudioChunk(streamId, chunk, callback) {
    try {
      const context = this.activeStreams.get(streamId);
      if (!context) {
        throw new Error("Stream context not found");
      }

      // Append chunk to buffer
      context.buffer = Buffer.concat([context.buffer, chunk]);

      // Process buffer if it's large enough
      if (context.buffer.length >= this.bufferSize) {
        const processedChunk = this.processBuffer(context.buffer);
        context.buffer = Buffer.alloc(0);
        callback(null, processedChunk);
      } else {
        callback();
      }
    } catch (error) {
      console.error("Audio Chunk Processing Error:", error);
      callback(error);
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

      // Create streaming response
      const audioStream = textToSpeech.createStreamingResponse(audioContent);

      // Broadcast transcription and response
      websocketService.broadcastToRoom(context.sessionId, {
        type: "transcription",
        data: {
          transcript: result.transcript,
          confidence: result.confidence,
          timestamp: Date.now(),
        },
      });

      websocketService.broadcastToRoom(context.sessionId, {
        type: "response",
        data: {
          text: response.text,
          audio: audioContent.toString("base64"),
          timestamp: Date.now(),
        },
      });

      return audioStream;
    } catch (error) {
      console.error("Transcription Handling Error:", error);
      throw new Error("Failed to handle transcription");
    }
  }

  // Stop stream processing
  async stopStream(streamId) {
    try {
      const context = this.activeStreams.get(streamId);
      if (!context) {
        throw new Error("Stream context not found");
      }

      // End conversation
      const summary = await conversationMemory.endConversation(
        context.sessionId
      );

      // Clean up stream
      context.isProcessing = false;
      this.activeStreams.delete(streamId);

      // Broadcast end of stream
      websocketService.broadcastToRoom(context.sessionId, {
        type: "stream_end",
        data: {
          summary,
          duration: Date.now() - context.startTime,
        },
      });

      return summary;
    } catch (error) {
      console.error("Stream Stop Error:", error);
      throw new Error("Failed to stop stream");
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
