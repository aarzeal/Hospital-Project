const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/verifyAccesstoken');
const patientController = require('../controllers/patientController');

// GET all patients
router.get('/patients',verifyToken(), patientController.getAllPatients);

// GET patient by ID
router.get('/patients/:id', patientController.getPatientById);

// POST create a new patient
router.post('/patients', patientController.createPatient);

// PUT update a patient by ID
router.put('/patients/:id', patientController.updatePatient);

// DELETE a patient by ID
router.delete('/patients/:id', patientController.deletePatient);

router.get('/patients/hospitalGroup/:id', patientController.getPatientsByHospitalGroupID);

router.get('/patient/Pagination', patientController.getAllPatientsByPagination);

module.exports = router;
