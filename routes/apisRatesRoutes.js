// routes/apisRatesRoutes.js

const express = require('express');
const router = express.Router();
const apisRatesController = require('../controllers/apisChargesController');

router.post('/create', apisRatesController.createCharge);
router.get('/calculate-charges', apisRatesController.calculateCharges);

router.get('/calculate-chargeswithdetails', apisRatesController.calculateChargeswithDetails);
router.get('/calculate-Hospitalcharges/:Apiname/:hospitalId/:startDate/:endDate', apisRatesController.calculateTotalChargesWithDetails);
router.get('/calculate-chargesbyhospitalId/:hospitalId/:startDate/:endDate', apisRatesController.calculateTotalChargesWithDetailsbyHospitalid);




module.exports = router;
