const jwt = require("jsonwebtoken");
const responseHandler = require("../helper/responseHandler");
const { StatusCodes } = require("http-status-codes");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return responseHandler(
      res,
      StatusCodes.UNAUTHORIZED,
      {
        error: "Authentication required"
      }
    );
  }

  const [type, token] = authHeader.split(' ');

  if (type !== "Bearer" || !token) {
    return responseHandler(
      res, 
      StatusCodes.UNAUTHORIZED, 
      {
        message: "Invalid authentication format"
      }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return responseHandler(
        res,
        StatusCodes.UNAUTHORIZED,
        {
          error: "Token expired"
        }
      );
      
    } else if (err.name === "JsonWebTokenError") {
      return responseHandler(
        res,
        StatusCodes.UNAUTHORIZED,
        {
          error: "Token invalid"
        }
      );
    }
  }
}

module.exports = {
  authenticate
}