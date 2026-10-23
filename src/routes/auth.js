const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validate the request before querying the database.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      email.length > 254 ||
      password.length > 128
    ) {
      return res.status(400).json({
        error: "Valid email and password are required.",
      });
    }

    // The JWT secret must be supplied through the environment.
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      return res.status(503).json({
        error: "Authentication service is not configured.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare(
        `
      SELECT id, email, password_hash, display_name
      FROM users
      WHERE email = ?
    `,
      )
      .get(normalizedEmail);

    // Use the same authentication error for unknown users and
    // incorrect passwords to avoid revealing which accounts exist.
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // The token contains only the user's identifier.
    const token = jwt.sign({}, secret, {
      subject: String(user.id),
      algorithm: "HS256",
      expiresIn: "15m",
      issuer: "mobile-app-api-security",
      audience: "mobile-app-client",
    });

    return res.status(200).json({
      message: "Login successful.",
      token_type: "Bearer",
      expires_in: 900,
      access_token: token,
      user: {
        id: user.id,
        display_name: user.display_name,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
