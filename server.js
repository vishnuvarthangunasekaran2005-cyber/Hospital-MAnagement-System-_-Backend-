const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/patients",     require("./routes/patients"));
app.use("/api/medicines",    require("./routes/medicines"));
app.use("/api/blood",        require("./routes/blood"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/admin",        require("./routes/admin"));

app.get("/", (req, res) => res.json({ message: "Hospital Management API is running" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Kill the process and restart.`);
      } else {
        console.error("❌ Server error:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
