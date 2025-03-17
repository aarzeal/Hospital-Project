const express = require('express');
const router = express.Router();
const AccessTokenVerify = require('../validators/Accesstokenverify');
// const {ensureSequelizeInstance} = require('../Middleware/ensureSequelizeInstance');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const hopsitalUserRides = require('../controllers/hopsitalUserRights');
const authenticate = require('../validators/authenticate');
// const ensureSequelizeInstance = require('../util/databasedyanamic');
// Routes
// router.get('/getmodulesbyuserId', AccessTokenVerify,authenticate, ensureSequelizeInstance.ensureSequelizeInstance, hopsitalUserRides.getUserModulesAndSubmodulesByUserId);
router.get('/getmodulesbyuserId', authenticate,AccessTokenVerify, ensureSequelizeInstance, hopsitalUserRides.getModulesAndSubModulesByUserId);

module.exports = router;
