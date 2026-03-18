const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  addStudent,
  toggleStudent,
  addSubscription,
  getTodayAttendance,
  manualMark,
  getMonthlyReport,
  getDashboardStats,
} = require("../controllers/admin.controller");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// All admin routes require login + admin role
router.use(verifyToken, isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Student management
router.get("/students", getAllStudents);
router.post("/students", addStudent);
router.put("/students/:id/toggle", toggleStudent);

// Subscription management
router.post("/subscriptions", addSubscription);

// Attendance
router.get("/attendance/today", getTodayAttendance);
router.post("/attendance/manual", manualMark);
router.get("/attendance/report", getMonthlyReport);

module.exports = router;