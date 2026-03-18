const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["lunch-only", "dinner-only", "both"],
      default: "both",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number, // Monthly fee amount (for records)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String, // Admin can add notes like "paid in cash", "half month", etc.
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual — check if subscription is currently valid
subscriptionSchema.virtual("isValid").get(function () {
  const today = new Date();
  return this.isActive && this.startDate <= today && this.endDate >= today;
});

module.exports = mongoose.model("Subscription", subscriptionSchema);