const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/MasterSubModules");

// Get all modules
router.get("/submodules", moduleController.getSubModules);

// Get a single module by ID
router.get("/submodules/:id", moduleController.getSubModules);
module.exports = router;
