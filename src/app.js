const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const db = require("./database/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "127.0.0.1";

// Apply HTTP security headers.
app.use(helmet());

// Accept JSON request bodies with a size limit.
app.use(express.json({ limit: "10kb" }));

// Basic API health check.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Mobile App and API Security",
    timestamp: new Date().toISOString(),
  });
});

// Verify the database connection and expected tables.
app.get("/api/db/health", (req, res) => {
  const tables = db
    .prepare(
      `
    SELECT name
    FROM sqlite_master
    WHERE type = ?
      AND name IN (?, ?)
    ORDER BY name
  `,
    )
    .all("table", "users", "profiles");

  res.status(200).json({
    status: "ok",
    database: "connected",
    tables: tables.map((table) => table.name),
  });
});

// Limit repeated login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again later.",
  },
});

// Authentication endpoints.
app.use("/api/auth", loginLimiter, authRoutes);

// Protected profile endpoints.
app.use("/api/profiles", profileRoutes);

// Return JSON for unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Handle unexpected errors without exposing internal details.
app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

// Listen only on this computer.
app.listen(PORT, HOST, () => {
  console.log(`API listening at http://${HOST}:${PORT}`);
});
