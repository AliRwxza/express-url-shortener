var express = require("express");
var router = express.Router();

var linkController = require('../controllers/linkController');
var authenticate = require('../middleware/authenticate');

router.post("/", authenticate.authenticate, linkController.insertLink);
router.delete("/:id", authenticate.authenticate, linkController.deleteLink);
router.get("/", authenticate.authenticate, linkController.retrieveLinks);
router.get("/:id", authenticate.authenticate, linkController.getLink);

module.exports = router;