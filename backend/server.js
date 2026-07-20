const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

// GET /api/health
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
// GET /api/properties
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
      sortBy = "L_ListingID",
      sortOrder = "desc",
    } = req.query;

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    // Only allow real column names from rets_property.
    // Never place an unchecked query parameter directly into ORDER BY.
    const allowedSortColumns = {
      L_ListingID: "L_ListingID",
      L_SystemPrice: "L_SystemPrice",
      OnMarketDate: "OnMarketDate",
      LM_Int2_3: "LM_Int2_3",
      L_Keyword2: "L_Keyword2",
};
    const normalizedSortOrder = String(sortOrder).toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(allowedSortColumns, sortBy)) {
      return res.status(400).json({
        status: "error",
        message:
          "sortBy must be one of: L_ListingID, L_SystemPrice, OnMarketDate, LM_Int2_3, L_Keyword2",
      });
    }

    if (!["asc", "desc"].includes(normalizedSortOrder)) {
      return res.status(400).json({
        status: "error",
        message: "sortOrder must be either asc or desc",
      });
    }

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

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const [countRows] = await pool.query(countSql, values);

    const sortColumn = allowedSortColumns[sortBy];
    const sqlSortOrder = normalizedSortOrder.toUpperCase();

    const dataSql = `
      SELECT *
      FROM rets_property
      ${whereClause}
      ORDER BY ${sortColumn} ${sqlSortOrder}
      LIMIT ?
      OFFSET ?
    `;

    const dataValues = [...values, parsedLimit, parsedOffset];
    const [rows] = await pool.query(dataSql, dataValues);

    return res.status(200).json({
      total: Number(countRows[0].total),
      limit: parsedLimit,
      offset: parsedOffset,
      sortBy,
      sortOrder: normalizedSortOrder,
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

// GET /api/properties/:id/openhouses
// Must be registered before /api/properties/:id.
app.get("/api/properties/:id/openhouses", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d{1,32}$/.test(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid listing ID",
      });
    }

    const [propertyRows] = await pool.query(
      `
        SELECT L_ListingID
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [id]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    const [openHouseRows] = await pool.query(
      `
        SELECT
          id,
          L_ListingID,
          L_DisplayId,
          OpenHouseDate,
          OH_StartTime,
          OH_EndTime,
          OH_StartDate,
          OH_EndDate,
          all_data,
          updated_date,
          up_date,
          API_OH_StartDate,
          API_OH_EndDate
        FROM rets_openhouse
        WHERE L_ListingID = ?
        ORDER BY OpenHouseDate ASC, OH_StartTime ASC
      `,
      [id]
    );

    return res.status(200).json(openHouseRows);
  } catch (error) {
    console.error("Open house lookup error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve open houses",
      error: error.message || "Unknown server error",
    });
  }
});

// GET /api/properties/:id
app.get("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d{1,32}$/.test(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid listing ID",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Property detail error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve property",
      error: error.message || "Unknown server error",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});