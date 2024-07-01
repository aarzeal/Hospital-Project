const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/verifyAccesstoken');
const patientController = require('../controllers/patientController');
const { createPatientValidationRules, updatePatientValidationRules } = require('../validators/hospitalValidator');

// GET all patients
router.get('/patients', verifyToken(), patientController.getAllPatients);

// GET patient by ID
router.get('/patients/:id', verifyToken(), patientController.getPatientById);

// POST create a new patient
router.post('/patients', verifyToken(), createPatientValidationRules(), patientController.createPatient);

// PUT update a patient by ID
router.put('/patients/:id', verifyToken(), updatePatientValidationRules(), patientController.updatePatient);

// DELETE a patient by ID
router.delete('/patients/:id', verifyToken(), patientController.deletePatient);

// GET patients by HospitalGroup ID
router.get('/patients/hospitalGroup/:id', verifyToken(), patientController.getPatientsByHospitalGroupID);

// GET all patients with pagination
router.get('/patients/pagination', verifyToken(), patientController.getAllPatientsByPagination);

module.exports = router;
