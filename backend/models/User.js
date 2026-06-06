const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      // required: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      default: null,
    },

    name: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    plan: {
      type: String,
      enum: ["free", "student", "pro", "unlimited"],
      default: "free",
    },

    sessionsThisWeek: {
      type: Number,
      default: 0,
    },

    weekResetDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    totalSessions: {
      type: Number,
      default: 0,
    },

    preferredRole: {
      type: String,
      default: null,
    },

    preferredLevel: {
      type: String,
      enum: ["fresher", "mid", "senior", null],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
