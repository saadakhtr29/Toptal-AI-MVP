const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

exports.transcribe = async (audioBuffer) => {
  const audioBytes = audioBuffer.toString('base64');

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'LINEAR16', // or 'MULAW' depending on format
      sampleRateHertz: 8000, // match your audio stream's rate
      languageCode: 'en-US',
    },
  };

  const [response] = await client.recognize(request);
  const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n');
  return transcription;
};