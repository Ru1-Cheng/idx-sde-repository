const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

// GET /api/health
// Checks whether the Express server can connect to MySQL.
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message || "Unable to connect to the database",
    });
  }
});

// GET /api/properties
// Supports filtering and pagination.
app.get("/api/properties", async (req, res) => {
  try {
    const {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit = "20",
      offset = "0",
    } = req.query;

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    // Validate pagination
    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "limit must be an integer between 1 and 100",
      });
    }

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        status: "error",
        message: "offset must be a non-negative integer",
      });
    }

    const conditions = [];
    const values = [];

    // City filter
    if (city !== undefined) {
      const trimmedCity = String(city).trim();

      if (!trimmedCity) {
        return res.status(400).json({
          status: "error",
          message: "city cannot be empty",
        });
      }

      conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(trimmedCity);
    }

    // ZIP code filter
    if (zipcode !== undefined) {
      const trimmedZipcode = String(zipcode).trim();

      if (!trimmedZipcode) {
        return res.status(400).json({
          status: "error",
          message: "zipcode cannot be empty",
        });
      }

      conditions.push("L_Zip = ?");
      values.push(trimmedZipcode);
    }

    // Minimum price filter
    let parsedMinPrice;

    if (minPrice !== undefined) {
      parsedMinPrice = Number(minPrice);

      if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
        return res.status(400).json({
          status: "error",
          message: "minPrice must be a non-negative number",
        });
      }

      conditions.push("L_SystemPrice >= ?");
      values.push(parsedMinPrice);
    }

    // Maximum price filter
    let parsedMaxPrice;

    if (maxPrice !== undefined) {
      parsedMaxPrice = Number(maxPrice);

      if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
        return res.status(400).json({
          status: "error",
          message: "maxPrice must be a non-negative number",
        });
      }

      conditions.push("L_SystemPrice <= ?");
      values.push(parsedMaxPrice);
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      return res.status(400).json({
        status: "error",
        message: "minPrice cannot be greater than maxPrice",
      });
    }

    // Bedrooms filter
    if (beds !== undefined) {
      const parsedBeds = Number(beds);

      if (!Number.isInteger(parsedBeds) || parsedBeds < 0) {
        return res.status(400).json({
          status: "error",
          message: "beds must be a non-negative integer",
        });
      }

      conditions.push("L_Keyword2 >= ?");
      values.push(parsedBeds);
    }

    // Bathrooms filter
    if (baths !== undefined) {
      const parsedBaths = Number(baths);

      if (!Number.isFinite(parsedBaths) || parsedBaths < 0) {
        return res.status(400).json({
          status: "error",
          message: "baths must be a non-negative number",
        });
      }

      conditions.push("LM_Dec_3 >= ?");
      values.push(parsedBaths);
    }

    const whereClause =
      conditions.length > 0
        ? ` WHERE ${conditions.join(" AND ")}`
        : "";

    // First query: get total number of matching properties
    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const [countRows] = await pool.query(countSql, values);

    // Second query: get the requested page of results
    const dataSql = `
      SELECT *
      FROM rets_property
      ${whereClause}
      LIMIT ?
      OFFSET ?
    `;

    const dataValues = [...values, parsedLimit, parsedOffset];
    const [rows] = await pool.query(dataSql, dataValues);

    return res.status(200).json({
      total: Number(countRows[0].total),
      limit: parsedLimit,
      offset: parsedOffset,
      results: rows,
    });
  } catch (error) {
    console.error("Property search error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve properties",
      error: error.message || "Unknown server error",
    });
  }
});

// Handle routes that do not exist
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});