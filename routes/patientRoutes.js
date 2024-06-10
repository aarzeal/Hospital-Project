const express = require('express');
const patientController = require('../controllers/patientController'); // Adjust the import path if necessary

const router = express.Router();

router.post('/patients', patientController.createPatient);
router.get('/patients/:HospitalID', patientController.getPatients);
router.get('/patients/:HospitalID/:id', patientController.getPatientById);
router.put('/patients/:HospitalID/:id', patientController.updatePatient);
router.delete('/patients/:HospitalID/:id', patientController.deletePatient);

module.exports = router;
