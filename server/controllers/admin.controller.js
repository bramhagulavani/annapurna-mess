const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Attendance = require("../models/Attendance");

// ─── Helper: Strip time from date ────────────────────────────────────────────
const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ═══════════════════════════════════════════════════════
// STUDENT MANAGEMENT
// ═══════════════════════════════════════════════════════

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const { search, active } = req.query;

    const filter = { role: "student" };
    if (active !== undefined) filter.isActive = active === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const students = await User.find(filter).sort({ name: 1 });

    // Attach active subscription to each student
    const studentsWithSubs = await Promise.all(
      students.map(async (student) => {
        const subscription = await Subscription.findOne({
          student: student._id,
          isActive: true,
          endDate: { $gte: new Date() },
        });
        return { ...student.toObject(), subscription: subscription || null };
      })
    );

    res.status(200).json({ success: true, count: students.length, students: studentsWithSubs });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/students — Admin adds a new student
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, password, phone } = req.body;

    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, roll number, email and password required." });
    }

    const existing = await User.findOne({ $or: [{ email }, { rollNumber: rollNumber.toUpperCase() }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "Student with this email or roll number already exists." });
    }

    const student = await User.create({ name, rollNumber, email, password, phone, role: "student" });

    res.status(201).json({
      success: true,
      message: `Student ${name} added successfully.`,
      student: { _id: student._id, name: student.name, rollNumber: student.rollNumber, email: student.email },
    });
  } catch (error) {
    console.error("Add student error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/students/:id/toggle — Activate or deactivate a student
const toggleStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.status(200).json({
      success: true,
      message: `${student.name} has been ${student.isActive ? "activated" : "deactivated"}.`,
      isActive: student.isActive,
    });
  } catch (error) {
    console.error("Toggle student error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ═══════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════

// POST /api/admin/subscriptions — Add/renew subscription for a student
const addSubscription = async (req, res) => {
  try {
    const { studentId, planType, startDate, endDate, amount, notes } = req.body;

    if (!studentId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Student ID, start date and end date are required." });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    // Deactivate any existing active subscription
    await Subscription.updateMany({ student: studentId, isActive: true }, { isActive: false });

    const subscription = await Subscription.create({
      student: studentId,
      planType: planType || "both",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Subscription added for ${student.name}.`,
      subscription,
    });
  } catch (error) {
    console.error("Add subscription error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ═══════════════════════════════════════════════════════
// ATTENDANCE — ADMIN VIEW & MANUAL OVERRIDE
// ═══════════════════════════════════════════════════════

// GET /api/admin/attendance/today — Today's headcount
const getTodayAttendance = async (req, res) => {
  try {
    const today = toDateOnly(new Date());

    const records = await Attendance.find({ date: today })
      .populate("student", "name rollNumber")
      .sort({ meal: 1 });

    const lunchList = records.filter((r) => r.meal === "lunch");
    const dinnerList = records.filter((r) => r.meal === "dinner");

    res.status(200).json({
      success: true,
      date: today,
      summary: {
        lunchCount: lunchList.length,
        dinnerCount: dinnerList.length,
      },
      lunch: lunchList,
      dinner: dinnerList,
    });
  } catch (error) {
    console.error("Get today attendance error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/attendance/manual — Admin manually marks attendance
const manualMark = async (req, res) => {
  try {
    const { studentId, date, meal, status } = req.body;

    if (!studentId || !date || !meal) {
      return res.status(400).json({ success: false, message: "Student ID, date and meal are required." });
    }

    const dateOnly = toDateOnly(new Date(date));

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, date: dateOnly, meal },
      { status: status || "present", markedBy: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const student = await User.findById(studentId);
    res.status(200).json({
      success: true,
      message: `Attendance updated for ${student?.name}.`,
      record,
    });
  } catch (error) {
    console.error("Manual mark error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/attendance/report?studentId=xxx&month=2024-01
const getMonthlyReport = async (req, res) => {
  try {
    const { studentId, month } = req.query;
    const [year, mon] = (month || `${new Date().getFullYear()}-${new Date().getMonth() + 1}`)
      .split("-")
      .map(Number);

    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0);

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (studentId) filter.student = studentId;

    const records = await Attendance.find(filter)
      .populate("student", "name rollNumber email")
      .sort({ date: 1, meal: 1 });

    // Group by student for summary
    const grouped = {};
    records.forEach((r) => {
      const id = r.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = { student: r.student, lunch: 0, dinner: 0, absent: 0 };
      }
      if (r.status === "present") {
        grouped[id][r.meal]++;
      } else {
        grouped[id].absent++;
      }
    });

    res.status(200).json({
      success: true,
      month: `${year}-${String(mon).padStart(2, "0")}`,
      records,
      summary: Object.values(grouped),
    });
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/dashboard — Quick stats for admin home
const getDashboardStats = async (req, res) => {
  try {
    const today = toDateOnly(new Date());
    const now = new Date();

    const [
      totalStudents,
      activeStudents,
      todayLunch,
      todayDinner,
      expiringSubscriptions,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", isActive: true }),
      Attendance.countDocuments({ date: today, meal: "lunch", status: "present" }),
      Attendance.countDocuments({ date: today, meal: "dinner", status: "present" }),
      Subscription.countDocuments({
        isActive: true,
        endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        todayLunch,
        todayDinner,
        expiringSubscriptions,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  toggleStudent,
  addSubscription,
  getTodayAttendance,
  manualMark,
  getMonthlyReport,
  getDashboardStats,
};