const express = require('express');
const router = express.Router();
const apisListController = require('../controllers/ApiListController');

// Route to get all Apis
router.get('/Allapis', apisListController.getAllApis);

// Route to get an Api by ID
router.get('/apis/:id', apisListController.getApiById);

module.exports = router;
