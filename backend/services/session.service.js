const Session = require("../models/Session");
const User = require("../models/User");
const {
  buildQuestionSet,
  incrementServedCount,
} = require("./question.service");

// ── Create session ────────────────────────────────────────────────────────────

const createSession = async (userId, role, roleLabel, level) => {
  // Check free tier limit
  const user = await User.findById(userId);

  // Reset weekly count if needed
  if (user.weekResetDate && new Date() > user.weekResetDate) {
    await User.findByIdAndUpdate(userId, {
      sessionsThisWeek: 0,
      weekResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    user.sessionsThisWeek = 0;
  }

  // Check session balance
  if (user.sessionBalance <= 0) {
    throw new Error("INSUFFICIENT_SESSIONS");
  }

  // Build question set
  const questions = await buildQuestionSet(role, roleLabel, level);

  if (questions.length === 0) {
    throw new Error("QUESTIONS_NOT_AVAILABLE");
  }

  // Format questions for session
  const sessionQuestions = questions.map((q, index) => ({
    questionId: q._id,
    order: index + 1,
    category: q.category,
    timeLimit: q.timeLimit,
    askedAt: null,
    answeredAt: null,
    followUpAsked: false,
    followUpText: null,
  }));

  // Create session
  const session = await Session.create({
    userId,
    role,
    roleLabel,
    level,
    status: "ready",
    questions: sessionQuestions,
    currentQuestionIndex: 0,
  });

  // Update role served count
  await incrementServedCount(role, level);

  // Update user preferred role and level, and decrement session credits
  await User.findByIdAndUpdate(userId, {
    preferredRole: role,
    preferredLevel: level,
    $inc: { sessionBalance: -1 }
  });

  return session;
};

// ── Start session ─────────────────────────────────────────────────────────────

const startSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.status !== "ready") throw new Error("SESSION_NOT_READY");

  const updated = await Session.findByIdAndUpdate(
    sessionId,
    {
      status: "in_progress",
      startedAt: new Date(),
    },
    { new: true },
  );

  return updated;
};

// ── Update current question ───────────────────────────────────────────────────

const updateCurrentQuestion = async (sessionId, userId, questionIndex) => {
  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.status !== "in_progress")
    throw new Error("SESSION_NOT_IN_PROGRESS");

  // Mark current question as asked
  const updated = await Session.findByIdAndUpdate(
    sessionId,
    {
      currentQuestionIndex: questionIndex,
      [`questions.${questionIndex}.askedAt`]: new Date(),
    },
    { new: true },
  );

  return updated;
};

// ── Mark question answered ────────────────────────────────────────────────────

const markQuestionAnswered = async (
  sessionId,
  userId,
  questionIndex,
  followUpAsked,
  followUpText,
) => {
  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("SESSION_NOT_FOUND");

  const updated = await Session.findByIdAndUpdate(
    sessionId,
    {
      [`questions.${questionIndex}.answeredAt`]: new Date(),
      [`questions.${questionIndex}.followUpAsked`]: followUpAsked || false,
      [`questions.${questionIndex}.followUpText`]: followUpText || null,
    },
    { new: true },
  );

  return updated;
};

// ── End session ───────────────────────────────────────────────────────────────

const endSession = async (sessionId, userId, motionData) => {
  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.status === "completed")
    throw new Error("SESSION_ALREADY_COMPLETED");

  const completedAt = new Date();
  const totalDuration = session.startedAt
    ? Math.floor((completedAt - session.startedAt) / 1000)
    : null;

  const updated = await Session.findByIdAndUpdate(
    sessionId,
    {
      status: "completed",
      completedAt,
      totalDuration,
      motionData: motionData || session.motionData,
    },
    { new: true },
  );

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalSessions: 1,
      sessionsThisWeek: 1,
    },
  });

  return updated;
};

// ── Abandon session ───────────────────────────────────────────────────────────

const abandonSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("SESSION_NOT_FOUND");

  const updated = await Session.findByIdAndUpdate(
    sessionId,
    { status: "abandoned" },
    { new: true },
  );

  return updated;
};

// ── Get session by ID ─────────────────────────────────────────────────────────

const getSessionById = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, userId }).populate(
    "questions.questionId",
    "question category timeLimit followUps",
  );

  if (!session) throw new Error("SESSION_NOT_FOUND");
  return session;
};

// ── Get user session history ──────────────────────────────────────────────────

const getSessionHistory = async (userId) => {
  const sessions = await Session.find({ userId })
    .select(
      "role roleLabel level status startedAt completedAt totalDuration reportGenerated reportId motionData",
    )
    .sort({ createdAt: -1 })
    .limit(20);

  return sessions;
};

module.exports = {
  createSession,
  startSession,
  updateCurrentQuestion,
  markQuestionAnswered,
  endSession,
  abandonSession,
  getSessionById,
  getSessionHistory,
};
