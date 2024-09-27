const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Get all logs for a specific date
router.get('/logs', logController.getAllLogs);

// Get a log by its ID
router.get('/logs/:id', logController.getLogById);

// Get logs within a specific time range
router.get('/logs/time', logController.getLogsByTime);

router.get('/errorcode', logController.getLogsByErrorCodeAndHospitalId);
// router.get('/logs/search', logController.getLogsByErrorCodeAndHospitalId);
module.exports = router;
