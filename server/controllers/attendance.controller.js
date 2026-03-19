const Attendance = require("../models/Attendance");
const Subscription = require("../models/Subscription");

const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// POST /api/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { meal } = req.body;

    if (!meal || !["lunch", "dinner"].includes(meal)) {
      return res.status(400).json({ success: false, message: 'Meal must be "lunch" or "dinner".' });
    }

    // Find active subscription
    const subscription = await Subscription.findOne({
      student: req.user._id,
      isActive: true,
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found. Contact admin to renew.",
      });
    }

    // Check if plan covers this meal
    if (meal === "lunch" && subscription.planType === "dinner-only") {
      return res.status(403).json({
        success: false,
        message: "Your plan does not include lunch.",
      });
    }
    if (meal === "dinner" && subscription.planType === "lunch-only") {
      return res.status(403).json({
        success: false,
        message: "Your plan does not include dinner.",
      });
    }

    // Check remaining meals
    if (meal === "lunch" && subscription.remainingLunchMeals <= 0) {
      return res.status(403).json({
        success: false,
        message: "No lunch meals remaining. Contact admin to renew.",
      });
    }
    if (meal === "dinner" && subscription.remainingDinnerMeals <= 0) {
      return res.status(403).json({
        success: false,
        message: "No dinner meals remaining. Contact admin to renew.",
      });
    }

    const today = toDateOnly(new Date());

    // Check if already marked today
    const existing = await Attendance.findOne({
      student: req.user._id,
      date: today,
      meal,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${meal} already marked for today!`,
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      student: req.user._id,
      date: today,
      meal,
      status: "present",
      markedBy: "self",
    });

    // Deduct meal count — carry forward logic
    // Only deduct when student actually comes, not on absent days
    if (meal === "lunch") {
      subscription.remainingLunchMeals -= 1;
    } else {
      subscription.remainingDinnerMeals -= 1;
    }

    // Auto deactivate if all meals used
    if (
      subscription.remainingLunchMeals <= 0 &&
      subscription.remainingDinnerMeals <= 0
    ) {
      subscription.isActive = false;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: `${meal.charAt(0).toUpperCase() + meal.slice(1)} marked! Meals remaining: ${
        meal === "lunch"
          ? subscription.remainingLunchMeals
          : subscription.remainingDinnerMeals
      }`,
      attendance,
      remainingLunchMeals: subscription.remainingLunchMeals,
      remainingDinnerMeals: subscription.remainingDinnerMeals,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/attendance/mine?month=2024-01
const getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query;

    let startDate, endDate;
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const records = await Attendance.find({
      student: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const summary = {
      totalLunch: records.filter((r) => r.meal === "lunch").length,
      totalDinner: records.filter((r) => r.meal === "dinner").length,
    };

    res.status(200).json({ success: true, records, summary });
  } catch (error) {
    console.error("Get my attendance error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res) => {
  try {
    const today = toDateOnly(new Date());

    const records = await Attendance.find({
      student: req.user._id,
      date: today,
    });

    // Also get subscription for remaining meals
    const subscription = await Subscription.findOne({
      student: req.user._id,
      isActive: true,
    });

    const status = {
      lunch: records.find((r) => r.meal === "lunch") || null,
      dinner: records.find((r) => r.meal === "dinner") || null,
    };

    res.status(200).json({
      success: true,
      status,
      remainingLunchMeals: subscription?.remainingLunchMeals || 0,
      remainingDinnerMeals: subscription?.remainingDinnerMeals || 0,
      planType: subscription?.planType || null,
    });
  } catch (error) {
    console.error("Get today status error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { markAttendance, getMyAttendance, getTodayStatus };