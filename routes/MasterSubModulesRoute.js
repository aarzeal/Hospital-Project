const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/MasterSubModules");


// Get all modules
router.get("/submodules", moduleController.getSubModules);

// Get a single module by ID
router.get("/submodules/:id", moduleController.getSubModules);
router.post('/createHospitalsubmodules',  moduleController.ensureSequelizeInstance, moduleController.createSubmodules);
router.get('/Hospitalsubmodule',  moduleController.ensureSequelizeInstance, moduleController.getSubModule);
router.get('/Hospitalsubmodules',  moduleController.ensureSequelizeInstance, moduleController.getAllSubModules);
router.put('/Hospitalsubmodule',  moduleController.ensureSequelizeInstance, moduleController.updateSubModule);


module.exports = router;
