const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Verify JWT Token ───────────────────────────────────────────────────────
const verifyToken = async (req, res, next) => {
  try {
    // Token comes in Authorization header as: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (catches deactivated accounts)
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated.",
      });
    }

    req.user = user; // Attach user to request for downstream use
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please login again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// ─── Admin Only ─────────────────────────────────────────────────────────────
// Always use AFTER verifyToken
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};

module.exports = { verifyToken, isAdmin };