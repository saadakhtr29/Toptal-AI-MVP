const speech = require("@google-cloud/speech");
const { Transform } = require("stream");
const path = require("path");

class SpeechToTextService {
  constructor() {
    // Set Google Cloud credentials path
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
      __dirname,
      "../config/google-credentials.json"
    );

    this.client = new speech.SpeechClient();
    this.config = {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      model: "phone_call",
      useEnhanced: true,
      enableAutomaticPunctuation: true,
      enableSpokenPunctuation: true,
      enableSpokenEmojis: false,
    };
  }

  // Convert audio to text
  async transcribeAudio(audioBuffer) {
    try {
      const request = {
        audio: {
          content: audioBuffer.toString("base64"),
        },
        config: this.config,
      };

      const [response] = await this.client.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      return {
        text: transcription,
        confidence: response.results[0].alternatives[0].confidence,
      };
    } catch (error) {
      console.error("Speech-to-Text Error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  // Stream audio for real-time transcription
  async streamTranscription(audioStream) {
    try {
      const recognizeStream = this.client
        .streamingRecognize({
          config: this.config,
          interimResults: true,
        })
        .on("error", (error) => {
          console.error("Streaming Error:", error);
        })
        .on("data", (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            const transcription = data.results[0].alternatives[0].transcript;
            const isFinal = data.results[0].isFinal;

            return {
              text: transcription,
              isFinal,
              confidence: data.results[0].alternatives[0].confidence,
            };
          }
        });

      audioStream.pipe(recognizeStream);
      return recognizeStream;
    } catch (error) {
      console.error("Streaming Transcription Error:", error);
      throw new Error("Failed to start streaming transcription");
    }
  }

  // Convert audio stream to text
  async transcribeStream(audioStream) {
    try {
      const request = {
        config: this.config,
        interimResults: false,
      };

      const recognizeStream = this.client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            return data.results[0].alternatives[0].transcript;
          }
        });

      audioStream.pipe(recognizeStream);
      return recognizeStream;
    } catch (error) {
      console.error("Speech-to-Text Error:", error);
      throw new Error("Failed to transcribe audio stream");
    }
  }

  // Convert audio file to text
  async transcribeFile(audioFile) {
    try {
      const request = {
        audio: {
          content: audioFile,
        },
        config: this.config,
      };

      const [response] = await this.client.recognize(request);
      return response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");
    } catch (error) {
      console.error("Speech-to-Text File Error:", error);
      throw new Error("Failed to transcribe audio file");
    }
  }

  // Start real-time transcription
  async startRealtimeTranscription(audioInputStream, onTranscription) {
    try {
      if (!audioInputStream || typeof audioInputStream.pipe !== "function") {
        throw new Error("Invalid audio input stream");
      }

      console.log("Starting real-time transcription with config:", this.config);

      const request = {
        config: this.config,
        interimResults: true,
      };

      // Create recognition stream with timeout
      const recognizeStream = this.client
        .streamingRecognize(request)
        .on("error", (error) => {
          console.error("Streaming Recognition Error:", error);
          onTranscription(error);
        })
        .on("data", (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            const result = {
              transcript: data.results[0].alternatives[0].transcript,
              isFinal: data.results[0].isFinal,
              confidence: data.results[0].alternatives[0].confidence,
            };
            onTranscription(null, result);
          }
        })
        .on("end", () => {
          console.log("Recognition stream ended");
        });

      // Set up keep-alive
      const keepAliveInterval = setInterval(() => {
        if (recognizeStream.writable) {
          recognizeStream.write({ audioContent: Buffer.alloc(0) });
        }
      }, 10000); // Send empty buffer every 10 seconds

      // Clean up keep-alive on stream end
      recognizeStream.on("end", () => {
        clearInterval(keepAliveInterval);
      });

      // Pipe audio data to recognition stream
      audioInputStream.pipe(recognizeStream);

      return recognizeStream;
    } catch (error) {
      console.error("Error starting real-time transcription:", error);
      throw new Error("Failed to start real-time transcription");
    }
  }

  // Process audio buffer for streaming
  processAudioBuffer(buffer) {
    // Add any necessary audio processing here
    // For example, converting sample rate, format, etc.
    return buffer;
  }

  // Stop real-time transcription
  stopRealtimeTranscription(stream) {
    if (stream) {
      stream.end();
    }
  }

  async processAudioChunk(streamId, audioData) {
    try {
      if (!audioData || !Buffer.isBuffer(audioData)) {
        throw new Error("Invalid audio data");
      }

      // Process audio chunk
      const request = {
        config: this.config,
        audio: {
          content: audioData.toString("base64"),
        },
      };

      const [response] = await this.client.recognize(request);
      return response;
    } catch (error) {
      console.error("Error processing audio chunk:", error);
      throw error;
    }
  }
}

module.exports = new SpeechToTextService();
