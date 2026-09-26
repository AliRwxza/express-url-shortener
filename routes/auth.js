var express = require("express");
var router = express.Router();

var authController = require("../controllers/authController");
var authenticate = require("../middleware/authenticate");

// Public routes
router.post("/login", authController.login);
router.post("/register", authController.register);

// Private routes
router.use(authenticate.authenticate);

router.get("/me", authController.getCurrentUser);

module.exports = router;