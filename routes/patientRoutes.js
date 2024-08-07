const express = require('express');
const router = express.Router();
const multer = require('multer');
// const authenticate = require('../Middleware/verifyAccesstoken');
const  authenticate  = require('../validators/authenticate');
const patientController = require('../controllers/patientController');
const { createPatientValidationRules, updatePatientValidationRules } = require('../validators/hospitalValidator');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const upload = multer();

// GET all patients
router.get('/patients', authenticate, patientController.getAllPatients);

// GET patient by ID
router.get('/patients/:id', authenticate, patientController.getPatientById);

// POST create a new patient
router.post('/patients',  authenticate, createPatientValidationRules(),validateJSONContentType,upload.single('file'), patientController.createPatient);

// PUT update a patient by ID
router.put('/patients/:id', authenticate, updatePatientValidationRules(), validateJSONContentType,patientController.updatePatient);

// DELETE a patient by ID
router.delete('/patients/:id', authenticate, patientController.deletePatient);

// GET patients by HospitalGroup ID
router.get('/patients/hospitalGroup/:id', authenticate, patientController.getPatientsByHospitalGroupID);

// GET all patients with pagination
router.get('/patients/pagination', authenticate, patientController.getAllPatientsByPagination);

///Get patient by searching using  fistname , lastname , middlename , phone , MRnumber 
router.get('/getPatient', authenticate,patientController.getPatient);




module.exports = router;
