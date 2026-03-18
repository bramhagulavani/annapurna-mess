const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

// ─── Helper: Generate JWT ────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── Helper: Send token response ────────────────────────────────────────────
const sendTokenResponse = (res, user, statusCode, message) => {
  const token = generateToken(user._id);

  const userData = {
    _id: user._id,
    name: user.name,
    rollNumber: user.rollNumber,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
// Admin registers students (or first admin self-registers)
const register = async (req, res) => {
    console.log("REGISTER HIT", req.body);
  try {
    const { name, rollNumber, email, password, phone, role } = req.body;

    // Basic validation
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, roll number, email and password are required.",
      });
    }

    // Check duplicates
    const existing = await User.findOne({
      $or: [{ email }, { rollNumber: rollNumber.toUpperCase() }],
    });

    if (existing) {
      const field = existing.email === email ? "Email" : "Roll number";
      return res.status(409).json({
        success: false,
        message: `${field} already registered.`,
      });
    }

    // Only allow creating admin if no admin exists yet (first-run setup)
    // After that, only existing admins can create users
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: "Admin already exists. Contact existing admin.",
        });
      }
    }

    const user = await User.create({
      name,
      rollNumber,
      email,
      password,
      phone,
      role: role || "student",
    });

    sendTokenResponse(res, user, 201, "Registration successful!");
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Explicitly select password (it's excluded by default in the schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    sendTokenResponse(res, user, 200, "Login successful!");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
// Get current logged-in user's profile + active subscription
const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Fetch their active subscription if any
    const subscription = await Subscription.findOne({
      student: user._id,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── PUT /api/auth/change-password ──────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook will hash it

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { register, login, getMe, changePassword };