const mongoose = require("mongoose");

const bloodStockSchema = new mongoose.Schema({
  group:      { type: String, required: true, unique: true },
  units:      { type: Number, required: true, default: 0 },
  lastUpdated: { type: String },
  status:     { type: String, enum: ["High", "Medium", "Low", "Critical"], default: "Medium" },
}, { timestamps: true });

bloodStockSchema.pre("save", function (next) {
  if (this.units >= 30) this.status = "High";
  else if (this.units >= 15) this.status = "Medium";
  else if (this.units >= 5) this.status = "Low";
  else this.status = "Critical";
  next();
});

const bloodDonorSchema = new mongoose.Schema({
  group:      { type: String, required: true },
  donorName:  { type: String, required: true },
  units:      { type: Number, required: true },
  donorAge:   { type: Number },
  contact:    { type: String },
  date:       { type: String },
}, { timestamps: true });

const bloodRequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  group:       { type: String, required: true },
  units:       { type: Number, required: true },
  doctor:      { type: String },
  ward:        { type: String },
  priority:    { type: String, enum: ["emergency", "urgent", "normal"], default: "normal" },
  status:      { type: String, enum: ["Pending", "Fulfilled", "Rejected"], default: "Pending" },
}, { timestamps: true });

module.exports = {
  BloodStock:   mongoose.model("BloodStock", bloodStockSchema),
  BloodDonor:   mongoose.model("BloodDonor", bloodDonorSchema),
  BloodRequest: mongoose.model("BloodRequest", bloodRequestSchema),
};
