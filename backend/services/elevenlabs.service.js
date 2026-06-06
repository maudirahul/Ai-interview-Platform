// services/elevenlabs.service.js
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateSpeech = async (text) => {
  try {
    const response = await groq.audio.speech.create({
      model: 'playai-tts',
      voice: 'Celeste-PlayAI',
      input: text,
      response_format: 'mp3',
    });

    const audioBuffer = await response.arrayBuffer();
    return Buffer.from(audioBuffer);

  } catch (err) {
    console.error('TTS error:', err.message);
    throw err;
  }
};

module.exports = { generateSpeech };