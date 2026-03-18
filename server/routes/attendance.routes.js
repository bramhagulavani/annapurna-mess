const express = require("express");
const router = express.Router();
const { markAttendance, getMyAttendance, getTodayStatus } = require("../controllers/attendance.controller");
const { verifyToken } = require("../middleware/authMiddleware");

// All attendance routes require login
router.use(verifyToken);

router.post("/mark", markAttendance);          // Mark lunch or dinner
router.get("/mine", getMyAttendance);          // Get my monthly history
router.get("/today", getTodayStatus);          // Check today's status

module.exports = router;