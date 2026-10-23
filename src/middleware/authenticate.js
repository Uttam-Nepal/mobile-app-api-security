const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(503).json({
      error: "Authentication service is not configured.",
    });
  }

  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

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

    // Use the verified identity from the token, not a
    // user ID supplied by the request.
    req.auth = { userId };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired authentication token.",
    });
  }
}

module.exports = authenticate;
