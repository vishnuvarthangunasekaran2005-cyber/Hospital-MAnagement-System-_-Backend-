const router = require("express").Router();
const Patient = require("../models/Patient");
const { protect, adminOnly } = require("../middleware/auth");

// GET all patients
router.get("/", protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { doctor: { $regex: search, $options: "i" } },
        { diagnosis: { $regex: search, $options: "i" } },
      ];
    }
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single patient
router.get("/:id", protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create patient
router.post("/", protect, async (req, res) => {
  try {
    if (await Patient.findOne({ id: req.body.id }))
      return res.status(400).json({ message: "Patient ID already exists" });
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update patient (admin can update any field, staff can only update status)
router.put("/:id", protect, async (req, res) => {
  try {
    const update = req.user.role === "admin" ? req.body : { status: req.body.status };
    const patient = await Patient.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE patient - admin only
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET stats
router.get("/stats/summary", protect, async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const admitted = await Patient.countDocuments({ status: "Admitted" });
    const discharged = await Patient.countDocuments({ status: "Discharged" });
    const revenue = await Patient.aggregate([{ $group: { _id: null, total: { $sum: "$fees" } } }]);
    res.json({ total, admitted, discharged, revenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
