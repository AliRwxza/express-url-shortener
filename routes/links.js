var express = require("express");
var router = express.Router();

var linkController = require('../controllers/linkController');
var authenticate = require('../middleware/authenticate');

/// Public routes
router.get("/:alias/qr", linkController.getLinkQR);

/// Private routes
router.use(authenticate.authenticate);

router.post("/", linkController.insertLink);
router.delete("/:id", linkController.deleteLink);
router.get("/", linkController.retrieveLinks);
router.get("/:id", linkController.getLink);

module.exports = router;