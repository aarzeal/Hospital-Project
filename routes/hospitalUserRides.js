const express = require('express');
const router = express.Router();
const AccessTokenVerify = require('../Middleware/AccessToken');
const ensureSequelizeInstance = require('../Middleware/ensureSequelizeInstance');
const hopsitalUserRides = require('../controllers/hopsitalUserRides');
const authenticate = require('../validators/authenticate');

// Routes
router.get('/getsubmodule', AccessTokenVerify,authenticate, ensureSequelizeInstance.ensureSequelizeInstance, hopsitalUserRides.getUserModulesAndSubmodules);

module.exports = router;
