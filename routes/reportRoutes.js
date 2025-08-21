
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/getReport", reportController.getReport);
router.get("/downloadReport", reportController.downloadReport);

module.exports = router;
