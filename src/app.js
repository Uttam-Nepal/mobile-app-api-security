const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const db = require("./database/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();

const HTTP_PORT = Number(process.env.PORT || 3000);
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 3443);
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

// Verify the SQLite connection and expected tables.
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

// Handle malformed bodies and unexpected errors safely.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Malformed JSON request body.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body too large.",
    });
  }

  console.error("Request error:", err.message);

  return res.status(500).json({
    error: "Internal server error",
  });
});

// Start HTTP for local comparison.
app.listen(HTTP_PORT, HOST, () => {
  console.log(`HTTP API listening at http://${HOST}:${HTTP_PORT}`);
});

// Start local HTTPS using the self-signed PFX certificate.
function startHttpsServer() {
  const pfxPath = path.join(__dirname, "..", "certs", "localhost.pfx");
  const pfxPassword = process.env.HTTPS_PFX_PASSWORD;

  if (!fs.existsSync(pfxPath)) {
    console.error("HTTPS not started: local PFX certificate was not found.");
    return;
  }

  if (!pfxPassword) {
    console.error("HTTPS not started: HTTPS_PFX_PASSWORD is not set.");
    return;
  }

  try {
    const pfx = fs.readFileSync(pfxPath);

    const httpsServer = https.createServer(
      {
        pfx,
        passphrase: pfxPassword,
      },
      app,
    );

    httpsServer.on("error", (error) => {
      console.error("HTTPS server error:", error.message);
    });

    httpsServer.listen(HTTPS_PORT, HOST, () => {
      console.log(`HTTPS API listening at https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error(
      "Could not initialise HTTPS. Check the PFX file and password:",
      error.message,
    );
  }
}

startHttpsServer();
