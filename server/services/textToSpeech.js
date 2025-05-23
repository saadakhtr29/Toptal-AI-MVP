const textToSpeech = require("@google-cloud/text-to-speech");
const { Readable } = require("stream");

class TextToSpeechService {
  constructor() {
    this.client = new textToSpeech.TextToSpeechClient();
    this.defaultVoice = {
      languageCode: "en-US",
      name: "en-US-Neural2-F",
      ssmlGender: "FEMALE",
    };
    this.defaultAudioConfig = {
      audioEncoding: "MP3",
      speakingRate: 1.0,
      pitch: 0,
      volumeGainDb: 0,
      effectsProfileId: ["large-home-entertainment-class-device"],
    };
  }

  // Synthesize text to speech
  async synthesize(text, options = {}) {
    try {
      const request = {
        input: { text },
        voice: { ...this.defaultVoice, ...options.voice },
        audioConfig: { ...this.defaultAudioConfig, ...options.audioConfig },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error("Text-to-Speech Error:", error);
      throw new Error("Failed to synthesize speech");
    }
  }

  // Synthesize SSML to speech
  async synthesizeSSML(ssml, options = {}) {
    try {
      const request = {
        input: { ssml },
        voice: { ...this.defaultVoice, ...options.voice },
        audioConfig: { ...this.defaultAudioConfig, ...options.audioConfig },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error("SSML Synthesis Error:", error);
      throw new Error("Failed to synthesize SSML");
    }
  }

  // Create a streaming response
  createStreamingResponse(audioContent) {
    return new Readable({
      read() {
        this.push(audioContent);
        this.push(null);
      },
    });
  }

  // Generate SSML with prosody
  generateSSML(text, options = {}) {
    const {
      rate = "medium",
      pitch = "medium",
      volume = "medium",
      pause = 0,
    } = options;

    return `
      <speak>
        <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
          ${text}
        </prosody>
        ${pause ? `<break time="${pause}ms"/>` : ""}
      </speak>
    `.trim();
  }

  // List available voices
  async listVoices(languageCode = "en-US") {
    try {
      const [response] = await this.client.listVoices({ languageCode });
      return response.voices;
    } catch (error) {
      console.error("Voice List Error:", error);
      throw new Error("Failed to list available voices");
    }
  }
}

module.exports = new TextToSpeechService();
