const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    roleLabel: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      required: true,
      enum: ["fresher", "mid", "senior"],
    },

    // Overall scores
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
      required: true,
    },

    // Category scores
    technicalScore: {
      subtotal: { type: Number, default: 0 }, // out of 50
      accuracy: { type: Number, default: 0 }, // out of 20
      depth: { type: Number, default: 0 }, // out of 15
      problemSolving: { type: Number, default: 0 }, // out of 15
      feedback: { type: String, default: null },
    },

    communicationScore: {
      subtotal: { type: Number, default: 0 }, // out of 25
      clarity: { type: Number, default: 0 }, // out of 10
      structure: { type: Number, default: 0 }, // out of 10
      confidence: { type: Number, default: 0 }, // out of 5
      feedback: { type: String, default: null },
    },

    behavioralScore: {
      subtotal: { type: Number, default: 0 }, // out of 25
      relevance: { type: Number, default: 0 }, // out of 10
      examples: { type: Number, default: 0 }, // out of 10
      professionalism: { type: Number, default: 0 }, // out of 5
      feedback: { type: String, default: null },
    },

    // Per question breakdown
    questionBreakdown: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        questionOrder: {
          type: Number,
        },
        questionText: {
          type: String,
        },
        category: {
          type: String,
        },
        score: {
          type: Number,
          // out of 100 per question
        },

        feedback: String,
        technicalScore: {
          accuracy: { type: Number, default: 0 },
          depth: { type: Number, default: 0 },
          problemSolving: { type: Number, default: 0 },
          feedback: String,
        },
        communicationScore: {
          clarity: { type: Number, default: 0 },
          structure: { type: Number, default: 0 },
          confidence: { type: Number, default: 0 },
          feedback: String,
        },
        behavioralScore: {
          relevance: { type: Number, default: 0 },
          examples: { type: Number, default: 0 },
          professionalism: { type: Number, default: 0 },
          feedback: String,
        },
        highlight: {
          type: String,
          default: null,
          // what they did well on this question
        },
        improvement: {
          type: String,
          default: null,
          // what to improve on this question
        },
        followUpAsked: {
          type: Boolean,
          default: false,
        },
        answerDuration: {
          type: Number,
          default: null,
        },
      },
    ],

    // Motion detection integrity
    integrityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    integrityDetails: {
      lookAwayCount: { type: Number, default: 0 },
      phoneDetectedCount: { type: Number, default: 0 },
      multiplePersonCount: { type: Number, default: 0 },
      verdict: {
        type: String,
        enum: ["clean", "suspicious", "violated"],
        default: "clean",
      },
    },

    // Overall feedback
    topStrengths: {
      type: [String],
      default: [],
      // 2-3 things they did well overall
    },

    topImprovements: {
      type: [String],
      default: [],
      // 2-3 most important things to improve
    },

    sessionDuration: {
      type: Number,
      default: null,
      // total session time in seconds
    },

    // Sharing
    isShareable: {
      type: Boolean,
      default: true,
    },

    shareToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      // unique token for public share link
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
