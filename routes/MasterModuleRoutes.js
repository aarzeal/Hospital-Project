const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/Mastermodule");
const { Sequelize } = require("sequelize");

// Get all modules
router.get("/modules", moduleController.getModules);

// Get a single module by ID
router.get("/modules/:id",  moduleController.getModules);

router.post('/createHospitalModules', moduleController.ensureSequelizeInstance, moduleController.creatmodules);
router.get('/moduleHospitalModules', moduleController.ensureSequelizeInstance, moduleController.getModule);
router.get('/AllmoduleHospitalModules', moduleController.ensureSequelizeInstance, moduleController.getAllModules);
router.put('/moduleHospitalModules', moduleController.ensureSequelizeInstance, moduleController.updateModule);

// router.post('/connection', moduleController.ensureSequelizeInstance);

module.exports = router;
