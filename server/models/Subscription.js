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
      required: true,
    },
    mealPrice: {
      type: Number,
      required: true, // 1500 for single, 3000 for both
    },
    totalLunchMeals: { type: Number, default: 0 },
    totalDinnerMeals: { type: Number, default: 0 },
    remainingLunchMeals: { type: Number, default: 0 },
    remainingDinnerMeals: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);