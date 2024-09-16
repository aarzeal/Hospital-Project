// routes/apisRatesRoutes.js

const express = require('express');
const router = express.Router();
const apisRatesController = require('../controllers/apisRatesController');

// Route to create a new ApisRate
router.post('/apisrates', apisRatesController.createApisRate);

// Route to get all ApisRates
router.get('/apisrates', apisRatesController.getAllApisRates);

// Route to get an ApisRate by ID
router.get('/apisrates/:id', apisRatesController.getApisRateById);

// Route to update an ApisRate by ID
router.put('/apisrates/:id', apisRatesController.updateApisRate);

// Route to delete an ApisRate by ID
router.delete('/apisrates/:id', apisRatesController.deleteApisRate);

module.exports = router;
