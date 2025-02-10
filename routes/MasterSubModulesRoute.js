const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/MasterSubModules");


// Get all modules
router.get("/submodules", moduleController.getSubModules);
router.get("/mastersubmodules/:moduleId",moduleController. getSubmodulesByModuleId);


// Get a single module by ID
router.get("/submodules/:id", moduleController.getSubModules);

router.post('/createHospitalsubmodules',  moduleController.ensureSequelizeInstance, moduleController.createSubmodules);
router.post('/createmoduleswithsubmodule',  moduleController.ensureSequelizeInstance, moduleController.createModulesWithSubmodules);
router.get('/Hospitalsubmodule',  moduleController.ensureSequelizeInstance, moduleController.getSubModule);
router.get('/Hospitalsubmodules',  moduleController.ensureSequelizeInstance, moduleController.getAllSubModules);
router.get('/HospitalAllsubmoduleswithmodules',  moduleController.ensureSequelizeInstance, moduleController.getAllModulesWithSubModules);
router.put('/Hospitalsubmodule',  moduleController.ensureSequelizeInstance, moduleController.updateSubModule);


module.exports = router;
