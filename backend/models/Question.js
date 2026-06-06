
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
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

    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    idealAnswer: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
    },

    followUps: {
      type: [String],
      default: [],
    },

    difficulty: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },

    timeLimit: {
      type: Number,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isAIGenerated: {
      type: Boolean,
      default: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes for fast querying during session building
questionSchema.index({ role: 1, level: 1, category: 1, isActive: 1 });
questionSchema.index({ isFlagged: 1 });

module.exports = mongoose.model("Question", questionSchema);
