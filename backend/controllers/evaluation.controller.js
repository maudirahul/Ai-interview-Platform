const { evaluateSession } = require("../services/evaluation.service");
const Session = require("../models/Session");

const evaluateSessionAnswers = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const results = await evaluateSession(
      sessionId,
      req.user._id,
      session.roleLabel,
      session.level,
    );

    res.status(200).json({
      success: true,
      count: results.length,
      evaluations: results,
    });
  } catch (err) {
    if (err.message === "NO_TRANSCRIPTS_FOUND") {
      return res.status(404).json({
        success: false,
        message: "No completed transcripts found for this session",
      });
    }
    next(err);
  }
};

module.exports = { evaluateSessionAnswers };
