const express = require("express");
const router = express.Router();
const { register, login, getMe, changePassword } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (need valid JWT)
router.get("/me", verifyToken, getMe);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;