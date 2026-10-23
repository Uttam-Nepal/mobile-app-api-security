const express = require("express");
const db = require("../database/db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Retrieve a profile only if it belongs to the authenticated user.
router.get("/:userId", authenticate, (req, res) => {
  const requestedUserId = Number(req.params.userId);

  if (!Number.isSafeInteger(requestedUserId) || requestedUserId <= 0) {
    return res.status(400).json({
      error: "Invalid profile ID.",
    });
  }

  // Never allow a user to choose another user's identity.
  if (requestedUserId !== req.auth.userId) {
    return res.status(404).json({
      error: "Profile not found.",
    });
  }

  const profile = db
    .prepare(
      `
    SELECT
      u.id AS user_id,
      u.display_name,
      p.city,
      p.bio,
      p.updated_at
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `,
    )
    .get(req.auth.userId);

  if (!profile) {
    return res.status(404).json({
      error: "Profile not found.",
    });
  }

  return res.status(200).json({
    profile,
  });
});

module.exports = router;
