const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/Mastermodule");

// Get all modules
router.get("/modules", moduleController.getModules);

// Get a single module by ID
router.get("/modules/:id", moduleController.getModules);
module.exports = router;
