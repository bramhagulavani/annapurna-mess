const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    meal: {
      type: String,
      enum: ["lunch", "dinner"],
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    markedBy: {
      type: String,
      enum: ["self", "admin"], // Who marked it
      default: "self",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index — one record per student per meal per day
// This prevents duplicate entries at the DB level
attendanceSchema.index({ student: 1, date: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);