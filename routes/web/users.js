const express = require("express");
const router = express.Router();

const userController = require("../../controllers/web/userController");
const {webAuth} = require("../../middleware/authenticate");

// Private routes
router.use(webAuth);

router.get("/profile", userController.profile);

module.exports = router;