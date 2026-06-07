const sessionService = require('../services/session.service');
const User = require("../models/User")

// Create a new session
const createSession = async (req, res, next) => {
  try {
    const { role, roleLabel, level } = req.body;

    if (!role || !roleLabel || !level) {
      return res.status(400).json({
        success: false,
        message: 'role, roleLabel and level are required',
      });
    }

    // 1. Create the session via your service layer
    const session = await sessionService.createSession(
      req.user._id,
      role,
      roleLabel,
      level
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          totalSessions: 1,
          sessionsThisWeek: 1 // Tracks weekly limit for your dashboard banner
        }
      }
    );

    // 3. Return response
    res.status(201).json({
      success: true,
      session,
    });

  } catch (err) {
    if (err.message === 'INSUFFICIENT_SESSIONS') {
      return res.status(403).json({
        success: false,
        message: 'You have run out of session credits. Please purchase a pack to continue.',
      });
    }
    if (err.message === 'QUESTIONS_NOT_AVAILABLE') {
      return res.status(503).json({
        success: false,
        message: 'Questions not available for this role yet, please try again',
      });
    }
    next(err);
  }
};

// Get session by ID
const getSession = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    if (err.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
    next(err);
  }
};

// Start session
const startSession = async (req, res, next) => {
  try {
    const session = await sessionService.startSession(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    if (err.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
    if (err.message === 'SESSION_NOT_READY') {
      return res.status(400).json({
        success: false,
        message: 'Session is not in ready state',
      });
    }
    next(err);
  }
};

// Update current question
const updateCurrentQuestion = async (req, res, next) => {
  try {
    const { questionIndex } = req.body;

    const session = await sessionService.updateCurrentQuestion(
      req.params.id,
      req.user._id,
      questionIndex
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    if (err.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
    next(err);
  }
};

// Mark question as answered
const markQuestionAnswered = async (req, res, next) => {
  try {
    const { questionIndex, followUpAsked, followUpText } = req.body;

    const session = await sessionService.markQuestionAnswered(
      req.params.id,
      req.user._id,
      questionIndex,
      followUpAsked,
      followUpText
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    next(err);
  }
};

// End session
const endSession = async (req, res, next) => {
  try {
    const { motionData } = req.body;
    console.log("=== END SESSION DEBUG ===");
    console.log("Route Param ID (req.params.id):", req.params.id);
    console.log("Authenticated User ID (req.user._id):", req.user._id);
    console.log("=========================");

    const session = await sessionService.endSession(
      req.params.id,
      req.user._id,
      motionData
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    if (err.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }
    if (err.message === 'SESSION_ALREADY_COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Session already completed',
      });
    }
    next(err);
  }
};

// Abandon session
const abandonSession = async (req, res, next) => {
  try {
    const session = await sessionService.abandonSession(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      session,
    });

  } catch (err) {
    next(err);
  }
};

// Get session history
const getSessionHistory = async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessionHistory(req.user._id);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSession,
  getSession,
  startSession,
  updateCurrentQuestion,
  markQuestionAnswered,
  endSession,
  abandonSession,
  getSessionHistory,
};