const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

const authenticate = require('../middleware/verifyAccesstoken'); // Adjust path as needed
const hospitalController = require('../controllers/HospitalController');

router.get('/departments',authenticate,hospitalController.ensureSequelizeInstance, departmentController.getAllDepartments);
router.get('/departments/:id',authenticate,hospitalController.ensureSequelizeInstance, departmentController.getDepartmentById);
router.post('/departments',authenticate,hospitalController.ensureSequelizeInstance, departmentController.createDepartment);
router.put('/departments/:id',authenticate, hospitalController.ensureSequelizeInstance,departmentController.updateDepartment);
router.delete('/departments/:id',authenticate, hospitalController.ensureSequelizeInstance,departmentController.deleteDepartment);

module.exports = router;
