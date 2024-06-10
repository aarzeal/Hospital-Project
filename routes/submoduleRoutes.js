const express = require('express');
const router = express.Router();
const submoduleController = require('../controllers/hopsitalSubmoduleControler');

// Routes

// GET all submodules
router.get('/', submoduleController.getAllSubmodules);

// POST a new submodule
router.post('/', submoduleController.createSubmodule);

// GET a submodule by ID
router.get('/:id', submoduleController.getSubmoduleById);

// Update a submodule
router.put('/:id', submoduleController.updateSubmodule);

// Delete a submodule
router.delete('/:id', submoduleController.deleteSubmodule);

// GET submodules by module_id
router.get('/module/:module_id', submoduleController.getSubmodulesByModuleId);

module.exports = router;
