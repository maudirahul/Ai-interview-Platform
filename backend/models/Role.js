const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
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

    questionCount: {
      type: Number,
      default: 0,
    },

    source: {
      type: String,
      enum: ["pre_generated", "on_demand"],
      default: "on_demand",
    },

    firstRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    firstRequestedAt: {
      type: Date,
      default: null,
    },

    servedCount: {
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

// Compound index — role + level combo must be unique
roleSchema.index({ role: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
