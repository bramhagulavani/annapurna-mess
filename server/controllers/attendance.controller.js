const Attendance = require("../models/Attendance");
const Subscription = require("../models/Subscription");

// ─── Cutoff times (24hr format) ──────────────────────────────────────────────
const CUTOFF = {
  lunch: 12,   // Mark lunch before 12:00 PM
  dinner: 20,  // Mark dinner before 8:00 PM
};

// ─── Helper: Strip time from date (for day-level comparisons) ────────────────
const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── POST /api/attendance/mark ───────────────────────────────────────────────
// Student marks their own lunch or dinner for today
const markAttendance = async (req, res) => {
  try {
    const { meal } = req.body; // "lunch" or "dinner"

    if (!meal || !["lunch", "dinner"].includes(meal)) {
      return res.status(400).json({ success: false, message: 'Meal must be "lunch" or "dinner".' });
    }

    // Check cutoff time
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= CUTOFF[meal]) {
      return res.status(400).json({
        success: false,
        message: `Cannot mark ${meal} after ${CUTOFF[meal]}:00. Time window has passed.`,
      });
    }

    // Check active subscription
    const subscription = await Subscription.findOne({
      student: req.user._id,
      isActive: true,
      endDate: { $gte: now },
      startDate: { $lte: now },
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found. Contact admin to renew.",
      });
    }

    // Check if plan covers this meal
    if (subscription.planType !== "both" && subscription.planType !== `${meal}-only`) {
      return res.status(403).json({
        success: false,
        message: `Your plan (${subscription.planType}) does not include ${meal}.`,
      });
    }

    const today = toDateOnly(now);

    // Upsert — if already marked, update it; if not, create it
    const attendance = await Attendance.findOneAndUpdate(
      { student: req.user._id, date: today, meal },
      { status: "present", markedBy: "self" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${meal.charAt(0).toUpperCase() + meal.slice(1)} attendance marked!`,
      attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET /api/attendance/mine?month=2024-01 ──────────────────────────────────
// Student views their own attendance for a given month
const getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query; // Format: "2024-01"

    let startDate, endDate;

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0); // Last day of month
    } else {
      // Default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const records = await Attendance.find({
      student: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Summary counts
    const summary = {
      totalLunch: records.filter((r) => r.meal === "lunch" && r.status === "present").length,
      totalDinner: records.filter((r) => r.meal === "dinner" && r.status === "present").length,
      totalAbsent: records.filter((r) => r.status === "absent").length,
    };

    res.status(200).json({ success: true, records, summary });
  } catch (error) {
    console.error("Get my attendance error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET /api/attendance/today ───────────────────────────────────────────────
// Student checks if they've marked today's meals
const getTodayStatus = async (req, res) => {
  try {
    const today = toDateOnly(new Date());

    const records = await Attendance.find({
      student: req.user._id,
      date: today,
    });

    const status = {
      lunch: records.find((r) => r.meal === "lunch") || null,
      dinner: records.find((r) => r.meal === "dinner") || null,
    };

    res.status(200).json({ success: true, status });
  } catch (error) {
    console.error("Get today status error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { markAttendance, getMyAttendance, getTodayStatus };