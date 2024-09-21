const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/CurrencyController');

// POST: Create new currency
router.post('/currency', currencyController.createCurrency);

// GET: Get all currencies
router.get('/currencies', currencyController.getAllCurrencies);

// GET: Get currency by code
router.get('/currency/:currencyCode', currencyController.getCurrencyByCode);

module.exports = router;
