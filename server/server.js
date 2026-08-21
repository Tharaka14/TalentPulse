const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const athleteRoutes = require("./routes/athleteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const matchStatsRoutes = require("./routes/matchStatsRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const scoutRoutes = require("./routes/scoutRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match-stats", matchStatsRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/scout", scoutRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentPulse API is running"
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS database_status"
    );

    res.json({
      success: true,
      api: "running",
      database: "connected",
      result: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      database: "connection failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `TalentPulse server running on port ${PORT}`
  );
});