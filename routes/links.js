var express = require("express");
var router = express.Router();

var linkController = require('../controllers/linkController');
var authenticate = require('../middleware/authenticate');

router.post("/", authenticate.authenticate, linkController.insertLink);
router.delete("/:value", authenticate.authenticate, linkController.deleteLink);
router.get("/", authenticate.authenticate, linkController.retrieveLinks);
router.get("/:alias", authenticate.authenticate, linkController.getLink);

module.exports = router;