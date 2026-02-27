const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // codeforcesId is the primary key — unique across all contests
    codeforcesId: {
      type: Number,
      required: true,
      unique: true,   // ← primary key
    },

    name: {
      type: String,
      required: true,
      trim: true,
      // no longer unique — codeforcesId is the primary key now
    },

    startTime: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    // Background System 2 will flip this to true after pushing to all calendars
    is_delivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Event", eventSchema);