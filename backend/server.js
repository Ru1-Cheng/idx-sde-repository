const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

// Temporary properties endpoint
app.get("/api/properties", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rets_property LIMIT 10"
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Unable to retrieve properties",
      error: error.message,
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});