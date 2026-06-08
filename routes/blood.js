const router = require("express").Router();
const { BloodStock, BloodDonor, BloodRequest } = require("../models/Blood");
const { protect, adminOnly } = require("../middleware/auth");

// ── Blood Stock ──

// GET all blood stock
router.get("/stock", protect, async (req, res) => {
  try {
    const stock = await BloodStock.find().sort({ group: 1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update blood stock - admin only
router.put("/stock/:group", adminOnly, async (req, res) => {
  try {
    const stock = await BloodStock.findOneAndUpdate(
      { group: req.params.group },
      { ...req.body, lastUpdated: new Date().toISOString().split("T")[0] },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Donors ──

// GET all donors
router.get("/donors", protect, async (req, res) => {
  try {
    const donors = await BloodDonor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add donor & update stock
router.post("/donors", protect, async (req, res) => {
  try {
    const donor = await BloodDonor.create(req.body);
    // Increase blood stock
    const stock = await BloodStock.findOne({ group: req.body.group });
    if (stock) {
      stock.units += Number(req.body.units);
      stock.lastUpdated = new Date().toISOString().split("T")[0];
      await stock.save();
    } else {
      await BloodStock.create({
        group: req.body.group,
        units: Number(req.body.units),
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    }
    res.status(201).json(donor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE donor - admin only
router.delete("/donors/:id", adminOnly, async (req, res) => {
  try {
    await BloodDonor.findByIdAndDelete(req.params.id);
    res.json({ message: "Donor record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Requests ──

// GET all blood requests
router.get("/requests", protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new blood request
router.post("/requests", protect, async (req, res) => {
  try {
    const request = await BloodRequest.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update request status - admin only
router.put("/requests/:id", adminOnly, async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    // If fulfilled, reduce stock
    if (req.body.status === "Fulfilled") {
      const stock = await BloodStock.findOne({ group: request.group });
      if (stock) {
        stock.units = Math.max(0, stock.units - request.units);
        await stock.save();
      }
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
