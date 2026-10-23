const express = require("express");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "127.0.0.1";

// Apply standard HTTP security headers.
app.use(helmet());

// Accept JSON request bodies with a small size limit.
app.use(express.json({ limit: "10kb" }));

// Basic health-check endpoint.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Mobile App and API Security",
    timestamp: new Date().toISOString(),
  });
});

// Return a consistent JSON response for unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Handle unexpected request errors without exposing internals.
app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

// Keep the development API accessible only from this computer.
app.listen(PORT, HOST, () => {
  console.log(`API listening at http://${HOST}:${PORT}`);
});
