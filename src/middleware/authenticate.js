const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(503).json({
      error: "Authentication service is not configured.",
    });
  }

  // The access token now comes from an HttpOnly cookie.
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: "mobile-app-api-security",
      audience: "mobile-app-client",
    });

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: "Invalid authentication token.",
      });
    }

    // Use the identity from the verified token.
    req.auth = { userId };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired authentication token.",
    });
  }
}

module.exports = authenticate;
