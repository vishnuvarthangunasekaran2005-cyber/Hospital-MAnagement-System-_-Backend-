const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

// POST /api/auth/seed-admin  — run once to create the first admin
router.post("/seed-admin", async (req, res) => {
  try {
    if (await User.findOne({ role: "admin" }))
      return res
        .status(400)
        .json({ message: "Admin already exists. Use /login." });

    const admin = await User.create({
      name: "Admin",
      email: "admin@hospital.com",
      password: "admin@123",
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      email: admin.email,
      defaultPassword: "admin@123",
    });
  } catch(err){
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register  — admin only
router.post("/register", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "staff",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user.id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
