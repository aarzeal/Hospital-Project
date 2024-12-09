const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Get all logs for a specific date
// router.get('/logs', logController.getAllLogs);

// Get a log by its ID
// router.get('/logs/:id', logController.getLogById);
// router.get('/logId/:id', logController.getbyLogId);

// Get logs within a specific time range
// router.get('/logs/time', logController.getLogsByTime);
router.get('/hospitallogs/:hospitalId', logController.getDataByHospitalId);
router.get('/hospitallogs/range-date/:hospitalId', logController.getDataByHospitalIdWithRangeDate);

// router.get('/error/:statusCode/:date', logController.getDataByStatusCode);
router.get('/hospitallogserrorr/:hospitalId/:message/:date', logController.getDataByMessage );
router.get('/searchErrorbytime/:date/:timestamp', logController.getDataByTimestampAndDate );
router.get('/searchErrorbylogid/:date/:logId', logController.getDataByLogIdAndDate );
router.get('/logs/date/:date', logController.getAllData);
router.get('/hospitallogs/logs/all', logController.getAllDataFromAllCollections)
router.get('/logs/logs', logController.getAllDataFromHospitalId)

router.get('/logs/date-range', logController.getAllDataInRangeDate)

// router.get('/log/errorCode', logController.getAllDataFromAllCollectionsByErrorCode)
router.get('/errologs/dateRange', logController.getAllDataFromAllCollectionsByDateRange)
// router.get('/errorlog/dateRange/:errorcode', logController.getAllDataFromAllCollectionsByErrorCode)
// router.get('/errorlog/errorCode', logController.getAllDataFromAllCollectionsByErrorCode)

// router.get('/errorcode', logController.getLogsByErrorCodeAndHospitalId);
// router.get('/logs/search', logController.getLogsByErrorCodeAndHospitalId);















router.get('/err/date-range/:hospitalId/:errorCode', logController.getDataByErrorCode);
router.get('/hospitallogserrorr/:hospitalId/:message/:date', logController.getDataByMessage );
router.get('/hospitallogs/logs/all', logController.getAllDataFromAllCollections)
router.get('/logs/logs', logController.getAllDataFromHospitalId)
router.get('/logs/date-range', logController.getAllDataInRangeDate)
router.get('/logs/date-range/hospitalId', logController.getAllDataFromHospitalIdWithRange)
router.get('/log/date-range/hospitalId', logController.getDataByStatusCodeAndDateRange)
router.get('/date-range/Apiname', logController.getDataByApiNameAndDateRange)
router.get('/date-rangewitherror', logController.getDataByErrorCodeAndDateRange)
router.get('/date-rangewithstatusCode', logController.getDataByStatusCodeAndDateRange)

router.get('/date-rangewithmassage', logController.getDataByMessageAndDateRange)
router.get('/date-rangewithlogid', logController.getDataByLogIdAndDateRange)



module.exports = router;
