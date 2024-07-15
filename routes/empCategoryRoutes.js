const express = require('express');
const router = express.Router();
const empCategoryController = require('../controllers/empCategory')
const authenticate = require('../Middleware/verifyAccesstoken');
const hospitalController = require('../controllers/HospitalController');
const validateJSONContentType = require('../Middleware/jsonvalidation');



router.get('/pagination',authenticate, hospitalController.ensureSequelizeInstance, empCategoryController.getEmpCategoryByPagination);
router.get('/emp-categories/:id', authenticate,hospitalController.ensureSequelizeInstance, empCategoryController.getEmpCategoryById);
router.post('/emp-categories',authenticate,validateJSONContentType, hospitalController.ensureSequelizeInstance, empCategoryController.createEmpCategory);
router.put('/emp-categories/:id', authenticate,validateJSONContentType,hospitalController.ensureSequelizeInstance, empCategoryController.updateEmpCategory);
// // router.patch('/emp-categories/:id', authenticate, hospitalController.ensureSequelizeInstance,empCategoryController.patchEmpCategory);
router.delete('/emp-categories/:id', authenticate,hospitalController.ensureSequelizeInstance, empCategoryController.deleteEmpCategory);

module.exports = router;
