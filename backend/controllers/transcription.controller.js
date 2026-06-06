const Transcript = require("../models/Transcript");
const { transcribeAudio } = require("../services/openai.service");

// Transcribe all answers for a session
const transcribeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get all transcripts for session
    const transcripts = await Transcript.find({
      sessionId,
      userId: req.user._id,
      transcriptionStatus: "pending",
    }).sort({ questionOrder: 1 });

    if (transcripts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending transcripts found for this session",
      });
    }

    // Process each transcript
    const results = [];

    for (const transcript of transcripts) {
      try {
        // Update status to processing
        await Transcript.findByIdAndUpdate(transcript._id, {
          transcriptionStatus: "processing",
        });

        // Transcribe main answer
        const text = await transcribeAudio(
          transcript.audioUrl,
          transcript.questionText,
        );

        // Update transcript with result
        await Transcript.findByIdAndUpdate(transcript._id, {
          transcript: text,
          transcriptionStatus: "completed",
        });

        // Transcribe follow up if exists
        if (transcript.followUpAudioUrl) {
          const followUpText = await transcribeAudio(
            transcript.followUpAudioUrl,
            transcript.followUpText || transcript.questionText,
          );

          await Transcript.findByIdAndUpdate(transcript._id, {
            followUpTranscript: followUpText,
          });
        }

        results.push({
          questionOrder: transcript.questionOrder,
          status: "completed",
        });
      } catch (err) {
        // Mark as failed but continue with others
        console.error(
          `❌ Transcription failed for Q${transcript.questionOrder}:`,
          err.message,
        );
        await Transcript.findByIdAndUpdate(transcript._id, {
          transcriptionStatus: "failed",
        });

        results.push({
          questionOrder: transcript.questionOrder,
          status: "failed",
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      results,
    });
  } catch (err) {
    next(err);
  }
};

// Get transcripts for a session
const getSessionTranscripts = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const transcripts = await Transcript.find({
      sessionId,
      userId: req.user._id,
    }).sort({ questionOrder: 1 });

    res.status(200).json({
      success: true,
      count: transcripts.length,
      transcripts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribeSession, getSessionTranscripts };
