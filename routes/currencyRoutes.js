const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/CurrencyController');
const authenticate = require('../Middleware/verifyAccesstoken'); // Adjust path as needed
const hospitalController = require('../controllers/HospitalController');

// POST: Create new currency
router.post('/currency', currencyController.createCurrency);

// GET: Get all currencies
router.get('/currencies', currencyController.getAllCurrencies);

router.get('/getCurrencyByPagination',authenticate,hospitalController.ensureSequelizeInstance, currencyController.getAllCurrenciesbypagination);

// GET: Get currency by code
router.get('/currency/:currencyCode', currencyController.getCurrencyByCode);

module.exports = router;
