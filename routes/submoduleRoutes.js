const express = require('express');
const router = express.Router();
const authenticate = require('../validators/authenticate');
const hospitalController = require('../controllers/HospitalController');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const submodulesController = require('../controllers/hopsitalSubmoduleControler');

// Routes

// GET all submodules
router.post('/create-submodules', authenticate,validateJSONContentType, hospitalController.ensureSequelizeInstance, submodulesController.createSubmodules);
router.get('/submodule', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getSubModule);
router.get('/submodules', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getAllSubModules);
router.put('/submodule/:id', authenticate,validateJSONContentType, hospitalController.ensureSequelizeInstance, submodulesController.updateSubModule);
router.get('/submodules/:id', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getSubModulesByModuleId);

module.exports = router;
