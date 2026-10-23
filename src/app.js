const express = require("express");
const helmet = require("helmet");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "127.0.0.1";

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

// Verify that the API is running.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Mobile App and API Security",
    timestamp: new Date().toISOString(),
  });
});

// Verify that the API can query the SQLite database.
app.get("/api/db/health", (req, res) => {
  const tables = db
    .prepare(
      `
    SELECT name
    FROM sqlite_master
    WHERE type = ? AND name IN (?, ?)
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

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Handle unexpected errors.
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
