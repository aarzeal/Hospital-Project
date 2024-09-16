const express = require('express');
const router = express.Router();
const authenticate = require('../validators/authenticate');
const hospitalController = require('../controllers/HospitalController');
const modulesController = require('../controllers/hopsitalModuleController');

// const moduleController = require('../controllers/hopsitalModuleController');

// router.post('/modules', moduleController.createModule);
// router.get('/modules', moduleController.getModules);
// router.get('/modules/:id', moduleController.getModuleById);
// router.put('/modules/:id', moduleController.updateModule);
// router.delete('/modules/:id', moduleController.deleteModule);

router.post('/create-modules', authenticate, hospitalController.ensureSequelizeInstance, modulesController.creatmodules);
router.get('/module', authenticate, hospitalController.ensureSequelizeInstance, modulesController.getModule);
router.get('/Allmodule', authenticate, hospitalController.ensureSequelizeInstance, modulesController.getAllModules);
router.put('/module', authenticate, hospitalController.ensureSequelizeInstance, modulesController.updateModule);

module.exports = router;
