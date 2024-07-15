const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/createEmployeecontroller');
const hospitalController = require('../controllers/HospitalController');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const authenticate = require('../Middleware/verifyAccesstoken');
// const validateEmployeeData = require('../validators/validateEmployeeData');

// Create a new employee
router.post('/',authenticate,validateJSONContentType,hospitalController.ensureSequelizeInstance, employeeController.createEmployee);

// Get all employees
router.get('/:id',authenticate, hospitalController.ensureSequelizeInstance,employeeController.getEmployee);

// Get an employee by ID
// router.get('/:id',authenticate, hospitalController.ensureSequelizeInstance,employeeController.getEmployeeById);

// Update an employee by ID
router.put('/:id',authenticate,validateJSONContentType, hospitalController.ensureSequelizeInstance, employeeController.updateEmployee);

// Delete an employee by ID
router.delete('/:id',authenticate, hospitalController.ensureSequelizeInstance, employeeController.deleteEmployee);

module.exports = router;
