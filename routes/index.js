var express = require('express');
var router = express.Router();
var linkController = require("../controllers/web/linkController");

// Public routes
router.get('/:alias', linkController.redirect);

module.exports = router;
