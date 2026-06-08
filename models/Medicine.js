const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  category: { type: String, required: true },
  stock:    { type: Number, required: true, default: 0 },
  price:    { type: Number, required: true },
  expiry:   { type: String, required: true },
  supplier: { type: String, required: true },
  status: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock",
  },
}, { timestamps: true });

// Auto-compute status before save
medicineSchema.pre("save", function (next) {
  if (this.stock === 0) this.status = "Out of Stock";
  else if (this.stock <= 20) this.status = "Low Stock";
  else this.status = "In Stock";
  next();
});

module.exports = mongoose.model("Medicine", medicineSchema);
