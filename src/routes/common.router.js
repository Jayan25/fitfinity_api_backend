const express = require("express");
const router = express.Router();
const commonController = require("../controllers/common.controller.js")

router.get("/version",  commonController.version);

module.exports = router;
