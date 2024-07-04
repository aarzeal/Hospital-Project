const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/verifyAccesstoken');
// const  authenticate  = require('../validators/authenticate');
const patientController = require('../controllers/patientController');
const { createPatientValidationRules, updatePatientValidationRules } = require('../validators/hospitalValidator');

// GET all patients
router.get('/patients', authenticate, patientController.getAllPatients);

// GET patient by ID
router.get('/patients/:id', authenticate, patientController.getPatientById);

// POST create a new patient
router.post('/patients',  authenticate, createPatientValidationRules(), patientController.createPatient);

// PUT update a patient by ID
router.put('/patients/:id', authenticate, updatePatientValidationRules(), patientController.updatePatient);

// DELETE a patient by ID
router.delete('/patients/:id', authenticate, patientController.deletePatient);

// GET patients by HospitalGroup ID
router.get('/patients/hospitalGroup/:id', authenticate, patientController.getPatientsByHospitalGroupID);

// GET all patients with pagination
router.get('/patients/pagination', authenticate, patientController.getAllPatientsByPagination);

module.exports = router;
