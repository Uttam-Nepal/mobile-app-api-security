const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/api",
  maxAge: 15 * 60 * 1000,
};

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

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

    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = jwt.sign({}, secret, {
      subject: String(user.id),
      algorithm: "HS256",
      expiresIn: "15m",
      issuer: "mobile-app-api-security",
      audience: "mobile-app-client",
    });

    // Send the token as a cookie instead of returning it
    // in JSON or storing it in JavaScript-readable localStorage.
    res.cookie("access_token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful.",
      auth_method: "HttpOnly cookie",
      expires_in: 900,
      user: {
        id: user.id,
        display_name: user.display_name,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api",
  });

  return res.status(200).json({
    message: "Logout successful.",
  });
});

module.exports = router;
