const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      error: "Authentication is needed."
    });
  }
  res.status(302).json({
    message: "authenticated."
  });
}