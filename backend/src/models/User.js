const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
    },

    picture: {
      type: String,
    },

    // Google OAuth tokens — needed to create Calendar events on their behalf
    accessToken: {
      type: String,
    },

    refreshToken: {
      type: String,
    },

    // Token expiry so we know when to refresh before calling Calendar API
    tokenExpiresAt: {
      type: Date,
    },

    // ID of the dedicated "ContestSync" calendar created on the user's Google account
    calendarId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);