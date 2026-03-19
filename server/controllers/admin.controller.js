const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Attendance = require("../models/Attendance");

const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = toDateOnly(new Date());

    const [totalStudents, activeStudents, todayLunch, todayDinner, expiringSubscriptions] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "student", isActive: true }),
        Attendance.countDocuments({ date: today, meal: "lunch", status: "present" }),
        Attendance.countDocuments({ date: today, meal: "dinner", status: "present" }),
        Subscription.countDocuments({
          isActive: true,
          $or: [
            { remainingLunchMeals: { $lte: 5, $gt: 0 } },
            { remainingDinnerMeals: { $lte: 5, $gt: 0 } },
          ],
        }),
      ]);

    res.status(200).json({
      success: true,
      stats: { totalStudents, activeStudents, todayLunch, todayDinner, expiringSubscriptions },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: "student" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const students = await User.find(filter).sort({ name: 1 });
    const today = toDateOnly(new Date());

    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        // Get active subscription
        const subscription = await Subscription.findOne({
          student: student._id,
          isActive: true,
        });

        // Get today's attendance
        const todayAttendance = await Attendance.find({
          student: student._id,
          date: today,
        });

        const todayLunch = todayAttendance.find((a) => a.meal === "lunch");
        const todayDinner = todayAttendance.find((a) => a.meal === "dinner");

        return {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phone: student.phone,
          isActive: student.isActive,
          subscription: subscription || null,
          todayLunch: todayLunch ? "present" : "absent",
          todayDinner: todayDinner ? "present" : "absent",
        };
      })
    );

    res.status(200).json({ success: true, students: studentsWithData });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/students
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, password, phone } = req.body;

    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required." });
    }

    const existing = await User.findOne({
      $or: [{ email }, { rollNumber: rollNumber.toUpperCase() }],
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Student already exists." });
    }

    const student = await User.create({ name, rollNumber, email, password, phone, role: "student" });

    res.status(201).json({
      success: true,
      message: `${name} added successfully!`,
      student: { _id: student._id, name: student.name, rollNumber: student.rollNumber },
    });
  } catch (error) {
    console.error("Add student error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/students/:id/toggle
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
      message: `${student.name} ${student.isActive ? "activated" : "deactivated"}.`,
      isActive: student.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/subscriptions
const addSubscription = async (req, res) => {
  try {
    const { studentId, planType, totalMeals, mealPrice, startDate, notes } = req.body;

    if (!studentId || !planType || !startDate) {
      return res.status(400).json({ success: false, message: "Student, plan and start date required." });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    // Deactivate existing subscription
    await Subscription.updateMany({ student: studentId, isActive: true }, { isActive: false });

    const meals = totalMeals || 30;
    const price = mealPrice || (planType === "both" ? 3000 : 1500);

    // Calculate expected end date (roughly 30 days)
    const start = new Date(startDate);
    const expectedEndDate = new Date(start);
    expectedEndDate.setDate(expectedEndDate.getDate() + 30);

    const subscription = await Subscription.create({
      student: studentId,
      planType,
      mealPrice: price,
      totalLunchMeals: planType === "dinner-only" ? 0 : meals,
      totalDinnerMeals: planType === "lunch-only" ? 0 : meals,
      remainingLunchMeals: planType === "dinner-only" ? 0 : meals,
      remainingDinnerMeals: planType === "lunch-only" ? 0 : meals,
      startDate: start,
      expectedEndDate,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Subscription added for ${student.name}!`,
      subscription,
    });
  } catch (error) {
    console.error("Add subscription error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/attendance/today
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
      summary: { lunchCount: lunchList.length, dinnerCount: dinnerList.length },
      lunch: lunchList,
      dinner: dinnerList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/attendance/manual
const manualMark = async (req, res) => {
  try {
    const { studentId, date, meal, status } = req.body;

    if (!studentId || !date || !meal) {
      return res.status(400).json({ success: false, message: "Student, date and meal required." });
    }

    const dateOnly = toDateOnly(new Date(date));

    const existing = await Attendance.findOne({ student: studentId, date: dateOnly, meal });
    if (existing) {
      return res.status(400).json({ success: false, message: "Attendance already marked for this day." });
    }

    const record = await Attendance.create({
      student: studentId,
      date: dateOnly,
      meal,
      status: status || "present",
      markedBy: "admin",
    });

    // Deduct meal if marking present
    if (status === "present" || !status) {
      const subscription = await Subscription.findOne({ student: studentId, isActive: true });
      if (subscription) {
        if (meal === "lunch") subscription.remainingLunchMeals -= 1;
        else subscription.remainingDinnerMeals -= 1;
        await subscription.save();
      }
    }

    const student = await User.findById(studentId);
    res.status(200).json({
      success: true,
      message: `Attendance marked for ${student?.name}.`,
      record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/attendance/report
const getMonthlyReport = async (req, res) => {
  try {
    const { studentId, month } = req.query;
    const [year, mon] = (
      month || `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
    )
      .split("-")
      .map(Number);

    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0);

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (studentId) filter.student = studentId;

    const records = await Attendance.find(filter)
      .populate("student", "name rollNumber email")
      .sort({ date: 1 });

    const grouped = {};
    records.forEach((r) => {
      const id = r.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = { student: r.student, lunch: 0, dinner: 0 };
      }
      if (r.status === "present") grouped[id][r.meal]++;
    });

    res.status(200).json({
      success: true,
      month: `${year}-${String(mon).padStart(2, "0")}`,
      summary: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  addStudent,
  toggleStudent,
  addSubscription,
  getTodayAttendance,
  manualMark,
  getMonthlyReport,
};