const express = require("express");
const router = express.Router();

const linkController = require('../../controllers/web/linkController');
const {webAuth} = require('../../middleware/authenticate');

// Private routes
router.use(webAuth);

router.get("/create", linkController.showInsertLink);
router.post("/create", linkController.insertLink);

router.get("/mylinks", linkController.showLinks);

router.get("/delete", linkController.showDeleteLink);
router.post("/delete", linkController.deleteLink);

router.get("/:id", linkController.displayLink);

module.exports = router;