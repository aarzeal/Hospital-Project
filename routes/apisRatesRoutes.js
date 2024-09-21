// routes/apisRatesRoutes.js

const express = require('express');
const router = express.Router();
const apisRatesController = require('../controllers/apisChargesController');

router.post('/create', apisRatesController.createCharge);
router.get('/calculate-charges', apisRatesController.calculateCharges);
router.get('/calculate-chargeswithdetails', apisRatesController.calculateChargeswithDetails);




module.exports = router;
