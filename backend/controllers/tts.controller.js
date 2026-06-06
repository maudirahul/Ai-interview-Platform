const { generateSpeech } = require("../services/elevenlabs.service");

const speak = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "text is required",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "text must be under 500 characters",
      });
    }

    const audioBuffer = await generateSpeech(text);

    // Send audio directly to frontend
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "no-cache",
    });

    res.send(audioBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { speak };
