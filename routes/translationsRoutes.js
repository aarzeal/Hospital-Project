const express = require('express');
const router = express.Router();
const translationsController = require('../controllers/translationsController');

// GET endpoint to retrieve translations
router.get('/translations/:component/:language', translationsController.getLabelsByLanguage);

// POST endpoint to update translations
router.post("/translations/:component", translationsController.createOrUpdateComponent);

module.exports = router;
