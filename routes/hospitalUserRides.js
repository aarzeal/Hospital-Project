
const express = require('express');
const router = express.Router();
const authenticate = require('../validators/authenticate');
const hospitalController = require('../controllers/HospitalController');
const rideController = require('../controllers/hopsitalUserRides');

// Routes

// GET all submodules
router.post('/create-rides', authenticate, hospitalController.ensureSequelizeInstance, rideController.creatrides);
// router.get('/submodule', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.get);
// router.put('/submodule', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.updateSubModule);
// router.get('/submodules/:id', authenticate, hospitalController.ensureSequelizeInstance, submodulesController.getSubModulesByModuleId);

module.exports = router;