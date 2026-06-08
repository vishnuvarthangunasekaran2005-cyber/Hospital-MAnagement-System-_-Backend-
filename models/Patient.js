const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  age:       { type: Number, required: true },
  gender:    { type: String, enum: ["Male", "Female", "Other"], required: true },
  blood:     { type: String, required: true },
  doctor:    { type: String, required: true },
  room:      { type: String, required: true },
  phone:     { type: String, required: true },
  address:   { type: String, required: true },
  diagnosis: { type: String, required: true },
  fees:      { type: Number, required: true },
  date:      { type: String, required: true },
  status:    { type: String, enum: ["Admitted", "Discharged", "Under Observation"], default: "Admitted" },
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
