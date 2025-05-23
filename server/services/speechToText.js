const speech = require("@google-cloud/speech");
const { Transform } = require("stream");

class SpeechToTextService {
  constructor() {
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
  async startRealtimeTranscription(audioStream, callback) {
    try {
      const request = {
        config: this.config,
        interimResults: true,
      };

      const recognizeStream = this.client
        .streamingRecognize(request)
        .on("error", (error) => {
          console.error("Streaming Recognition Error:", error);
          callback(error);
        })
        .on("data", (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            callback(null, {
              transcript: data.results[0].alternatives[0].transcript,
              isFinal: data.results[0].isFinal,
              confidence: data.results[0].alternatives[0].confidence,
            });
          }
        });

      // Create a transform stream to convert audio chunks
      const transformStream = new Transform({
        transform(chunk, encoding, callback) {
          // Convert audio chunk to the required format
          const audioChunk = this.processAudioChunk(chunk);
          callback(null, audioChunk);
        },
        processAudioChunk(chunk) {
          // Add any necessary audio processing here
          // For example, converting sample rate, format, etc.
          return chunk;
        },
      });

      // Pipe audio stream through transform and to recognition
      audioStream.pipe(transformStream).pipe(recognizeStream);

      return recognizeStream;
    } catch (error) {
      console.error("Real-time Transcription Error:", error);
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
}

module.exports = new SpeechToTextService();
