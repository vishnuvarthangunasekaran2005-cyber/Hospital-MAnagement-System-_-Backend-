const router = require("express").Router();
const Doctor = require("../models/Doctor");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/doctors - Get all doctors (any authenticated user)
router.get("/", protect, async (req, res) => {
  try {
    const { status, specialization } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors - Add new doctor (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, specialization, qualification, experience, phone, email, schedule, consultationFee } = req.body;

    if (!name || !specialization || !qualification || experience === undefined || !phone || !email || consultationFee === undefined) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existing = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Doctor with this email already exists" });
    }

    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/doctors/:id - Update doctor (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/doctors/:id - Delete doctor (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
