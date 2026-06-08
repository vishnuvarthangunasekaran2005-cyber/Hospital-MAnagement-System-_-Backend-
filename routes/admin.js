const router = require("express").Router();
const User = require("../models/User");
const Patient = require("../models/Patient");
const Medicine = require("../models/Medicine");
const Appointment = require("../models/Appointment");
const { BloodStock, BloodRequest } = require("../models/Blood");
const { adminOnly } = require("../middleware/auth");

// GET dashboard summary stats - admin only
router.get("/stats", adminOnly, async (req, res) => {
  try {
    const [
      totalPatients,
      admitted,
      discharged,
      revenueAgg,
      totalMedicines,
      lowStock,
      outOfStock,
      totalAppointments,
      pendingRequests,
      totalUsers,
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: "Admitted" }),
      Patient.countDocuments({ status: "Discharged" }),
      Patient.aggregate([{ $group: { _id: null, total: { $sum: "$fees" } } }]),
      Medicine.countDocuments(),
      Medicine.countDocuments({ status: "Low Stock" }),
      Medicine.countDocuments({ status: "Out of Stock" }),
      Appointment.countDocuments(),
      BloodRequest.countDocuments({ status: "Pending" }),
      User.countDocuments(),
    ]);

    res.json({
      totalPatients,
      admitted,
      discharged,
      revenue: revenueAgg[0]?.total || 0,
      totalMedicines,
      lowStock,
      outOfStock,
      totalAppointments,
      pendingBloodRequests: pendingRequests,
      totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users - admin only
router.get("/users", adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update user role - admin only
router.put("/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE user - admin only
router.delete("/users/:id", adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
