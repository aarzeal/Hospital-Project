const express = require('express');
const router = express.Router();
const AccessTokenVerify = require('../validators/Accesstokenverify');
const ensureSequelizeInstance = require('../Middleware/ensureSequelizeInstance');
const hopsitalUserRides = require('../controllers/hopsitalUserRights');
const authenticate = require('../validators/authenticate');

// Routes
// router.get('/getmodulesbyuserId', AccessTokenVerify,authenticate, ensureSequelizeInstance.ensureSequelizeInstance, hopsitalUserRides.getUserModulesAndSubmodulesByUserId);
router.get('/getmodulesbyuserId', AccessTokenVerify,authenticate, ensureSequelizeInstance.ensureSequelizeInstance, hopsitalUserRides.getModulesAndSubModulesByUserId);

module.exports = router;
