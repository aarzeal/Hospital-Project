const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Get all logs for a specific date
router.get('/logs', logController.getAllLogs);

// Get a log by its ID
router.get('/logs/:id', logController.getLogById);
router.get('/logId/:id', logController.getbyLogId);

// Get logs within a specific time range
router.get('/logs/time', logController.getLogsByTime);
router.get('/hospitallogs/:hospitalId', logController.getDataByHospitalId);
router.get('/hospitallogserror/:hospitalId/:errorCode/:date', logController.getDataByErrorCode);
router.get('/hospitallogserrorr/:hospitalId/:message/:date', logController.getDataByMessage );
router.get('/searchErrorbytime/:date/:timestamp', logController.getDataByTimestampAndDate );
router.get('/searchErrorbylogid/:date/:logId', logController.getDataByLogIdAndDate );
router.get('/logs/date/:date', logController.getAllData);
router.get('/hospitallogs/logs/all', logController.getAllDataFromAllCollections)

router.get('/errorcode', logController.getLogsByErrorCodeAndHospitalId);
// router.get('/logs/search', logController.getLogsByErrorCodeAndHospitalId);
module.exports = router;
