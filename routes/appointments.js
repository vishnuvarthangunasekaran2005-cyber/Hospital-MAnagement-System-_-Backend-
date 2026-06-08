const router = require("express").Router();
const Appointment = require("../models/Appointment");
const { protect, adminOnly } = require("../middleware/auth");

// GET all appointments
router.get("/", protect, async (req, res) => {
  try {
    const { date, doctor, status } = req.query;
    let query = {};
    if (date) query.date = date;
    if (doctor) query.doctor = { $regex: doctor, $options: "i" };
    if (status) query.status = status;
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create appointment
router.post("/", protect, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update appointment
router.put("/:id", protect, async (req, res) => {
  try {
    const update = req.user.role === "admin" ? req.body : { status: req.body.status };
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE appointment - admin only
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
