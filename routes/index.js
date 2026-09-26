var express = require('express');
var router = express.Router();
var linkController = require("../controllers/linkController");

/* GET home page. */
router.get('/:alias', linkController.redirect);

module.exports = router;
