const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    roleLabel: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      required: true,
      enum: ["fresher", "mid", "senior"],
    },

    status: {
      type: String,
      enum: [
        "preparing", // questions being fetched or generated
        "ready", // questions ready, waiting for user to start
        "in_progress", // interview is live
        "completed", // all questions answered
        "abandoned", // user left mid session
      ],
      default: "preparing",
    },

    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        order: {
          type: Number,
          required: true,
          // 1 to 10 — sequence of questions in this session
        },
        category: {
          type: String,
          required: true,
        },
        timeLimit: {
          type: Number,
          required: true,
        },
        askedAt: {
          type: Date,
          default: null,
          // when avatar started asking this question
        },
        answeredAt: {
          type: Date,
          default: null,
          // when user finished answering
        },
        followUpAsked: {
          type: Boolean,
          default: false,
        },
        followUpText: {
          type: String,
          default: null,
        },
      },
    ],

    currentQuestionIndex: {
      type: Number,
      default: 0,
      // tracks where user is in the session
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    totalDuration: {
      type: Number,
      default: null,
      // in seconds — calculated when session ends
    },

    motionData: {
      lookAwayCount: { type: Number, default: 0 },
      phoneDetectedCount: { type: Number, default: 0 },
      multiplePersonCount: { type: Number, default: 0 },
      integrityScore: { type: Number, default: 100 },
      // starts at 100, deducted per violation
    },

    reportGenerated: {
      type: Boolean,
      default: false,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);
