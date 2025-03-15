const express = require('express');
const router = express.Router();
const itemContentController = require('../controllers/itemContentController.js');
const authenticate = require('../validators/authenticate.js');
const userverifiction = require('../validators/Accesstokenverify.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
const validator = require('../validators/TaxValidators.js');


router.post('/item-content', validateJSONContentType, validator.validateItemContent, authenticate, userverifiction, ensureSequelizeInstance, itemContentController.createContent);

module.exports = router;