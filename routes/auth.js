var express = require("express");
var router = express.Router();

var authController = require("../controllers/authController");
var authenticate = require("../middleware/authenticate");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authenticate.authenticate, authController.getCurrentUser);

module.exports = router;