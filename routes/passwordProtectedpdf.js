const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/passwordProtected');

// POST request to generate a password-protected PDF
router.post('/generate-pdf', pdfController.generatePDF);

module.exports = router;
