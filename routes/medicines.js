const router = require("express").Router();
const Medicine = require("../models/Medicine");
const { protect, adminOnly } = require("../middleware/auth");

// GET all medicines
router.get("/", protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single medicine
router.get("/:id", protect, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ id: req.params.id });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create medicine
router.post("/", protect, async (req, res) => {
  try {
    if (await Medicine.findOne({ id: req.body.id }))
      return res.status(400).json({ message: "Medicine ID already exists" });
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update medicine (admin full access, staff can only update stock)
router.put("/:id", protect, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ id: req.params.id });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    const update = req.user.role === "admin" ? req.body : { stock: req.body.stock };
    Object.assign(medicine, update);
    await medicine.save();
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE medicine - admin only
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ id: req.params.id });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET stats
router.get("/stats/summary", protect, async (req, res) => {
  try {
    const total = await Medicine.countDocuments();
    const inStock = await Medicine.countDocuments({ status: "In Stock" });
    const lowStock = await Medicine.countDocuments({ status: "Low Stock" });
    const outOfStock = await Medicine.countDocuments({ status: "Out of Stock" });
    res.json({ total, inStock, lowStock, outOfStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
