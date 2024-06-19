const express = require('express');
const router = express.Router();
const authenticate = require('../validators/authenticate');
const hospitalController = require('../controllers/HospitalController');
const submodulesController = require('../controllers/hopsitalSubmoduleControler');

// Routes

// GET all submodules
router.post('/create-submodules', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.creatsubmodules);
router.get('/submodule', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getSubModule);
router.put('/submodule', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.updateSubModule);
router.get('/submodules/:id', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getSubModulesByModuleId);

module.exports = router;
