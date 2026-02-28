const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — prevents duplicate deliveries at the DB level
// Even if the job runs twice, the same pair can never be inserted twice
deliverySchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model("Delivery", deliverySchema);