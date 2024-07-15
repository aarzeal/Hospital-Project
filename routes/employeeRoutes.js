const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/createEmployeecontroller');
const hospitalController = require('../controllers/HospitalController');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const authenticate = require('../Middleware/verifyAccesstoken');
// const validateEmployeeData = require('../validators/validateEmployeeData');
const { createEmployeeValidationRules, updateEmployeeValidationRules, } = require('../validators/hospitalValidator');

// Create a new employee
router.post('/employee',authenticate,validateJSONContentType,createEmployeeValidationRules(),hospitalController.ensureSequelizeInstance, employeeController.createEmployee);

router.get('/employee',authenticate,hospitalController.ensureSequelizeInstance, employeeController.getAllEmployees);



// Get all employees
router.get('/employee/:id',authenticate, hospitalController.ensureSequelizeInstance,employeeController.getEmployee);

// Get an employee by ID
// router.get('/:id',authenticate, hospitalController.ensureSequelizeInstance,employeeController.getEmployeeById);

// Update an employee by ID
router.put('/employee/:id',authenticate,validateJSONContentType,updateEmployeeValidationRules(), hospitalController.ensureSequelizeInstance, employeeController.updateEmployee);

// Delete an employee by ID
router.delete('/employee/:id',authenticate, hospitalController.ensureSequelizeInstance, employeeController.deleteEmployee);

router.get('/pagination',authenticate, hospitalController.ensureSequelizeInstance, employeeController.getEmployeeWithPagination);

module.exports = router;
