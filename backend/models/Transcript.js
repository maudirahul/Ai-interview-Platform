const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    questionOrder: {
      type: Number,
      required: true,
      // matches order field in session.questions array
    },

    questionText: {
      type: String,
      required: true,
      // stored here so report works even if question is deleted later
    },

    category: {
      type: String,
      required: true,
      enum: [
        "dsa",
        "cs_fundamentals",
        "system_design",
        "role_specific",
        "behavioral",
        "communication",
      ],
    },

    // Main answer
    audioUrl: {
      type: String,
      required: true,
      // Cloudinary URL of recorded audio
    },

    transcript: {
      type: String,
      default: null,
      // Whisper transcription of audio
    },

    transcriptionStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    answerDuration: {
      type: Number,
      default: null,
      // in seconds — how long user spoke
    },

    // Follow up answer if asked
    followUpAsked: {
      type: Boolean,
      default: false,
    },

    followUpText: {
      type: String,
      default: null,
      // the follow up question that was asked
    },

    followUpAudioUrl: {
      type: String,
      default: null,
      // Cloudinary URL of follow up answer audio
    },

    followUpTranscript: {
      type: String,
      default: null,
      // Whisper transcription of follow up answer
    },

    followUpDuration: {
      type: Number,
      default: null,
      // in seconds
    },

    // Evaluation status
    evaluationStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    evaluation: {
      technical: {
        accuracy: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        feedback: { type: String, default: null },
      },
      communication: {
        clarity: { type: Number, default: 0 },
        structure: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        feedback: { type: String, default: null },
      },
      behavioral: {
        relevance: { type: Number, default: 0 },
        examples: { type: Number, default: 0 },
        professionalism: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        feedback: { type: String, default: null },
      },
      totalScore: { type: Number, default: 0 },
      highlight: { type: String, default: null },
      improvement: { type: String, default: null },
      needsFollowUp: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

// Indexes
transcriptSchema.index({ sessionId: 1, questionOrder: 1 });
transcriptSchema.index({ userId: 1 });
transcriptSchema.index({ transcriptionStatus: 1 });
transcriptSchema.index({ evaluationStatus: 1 });

module.exports = mongoose.model("Transcript", transcriptSchema);
