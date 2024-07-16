const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skilsController');
const hospitalController = require('../controllers/HospitalController');
// const authenticate = require('../Middleware/verifyAccesstoken');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const { createSkillValidationRules,updateSkillValidationRules } = require('../validators/hospitalValidator');

// GET all skills
router.get('/skills',authenticate, hospitalController.ensureSequelizeInstance,skillController.getAllSkills);

// GET single skill by ID
router.get('/skills/:id', authenticate, hospitalController.ensureSequelizeInstance,skillController.getSkillById);

// GET single skill by pagination
router.get('/paginated', authenticate, hospitalController.ensureSequelizeInstance,skillController.getSkillsWithPagination);

// POST create a new skill
router.post('/skills', authenticate,validateJSONContentType,createSkillValidationRules(),  hospitalController.ensureSequelizeInstance,skillController.createSkill);

// PUT update an existing skill
router.put('/skills/:id',authenticate, validateJSONContentType,updateSkillValidationRules(), hospitalController.ensureSequelizeInstance,skillController.updateSkill);

// DELETE delete a skill
router.delete('/skills/:id',authenticate, hospitalController.ensureSequelizeInstance, skillController.deleteSkill);



module.exports = router;
