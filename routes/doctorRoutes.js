const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authenticate = require('../validators/authenticate'); // Adjust path as needed

const validateJSONContentType = require('../Middleware/jsonvalidation');
const hospitalController = require('../controllers/HospitalController');

router.get('/doctors', authenticate,hospitalController.ensureSequelizeInstance,  doctorController.getAllDoctors);
router.get('/doctors/:id', authenticate,hospitalController.ensureSequelizeInstance, doctorController.getDoctorById);
router.post('/doctors', authenticate,validateJSONContentType,hospitalController.ensureSequelizeInstance, doctorController.createDoctor);
router.put('/doctors/:id', authenticate, validateJSONContentType,hospitalController.ensureSequelizeInstance,doctorController.updateDoctor);
router.delete('/doctors/:id', authenticate, hospitalController.ensureSequelizeInstance,doctorController.deleteDoctor);
router.get('/hospital/:hospitalId', authenticate, hospitalController.ensureSequelizeInstance,doctorController.getDoctorsByHospitalId);
router.get('/paginated', authenticate, hospitalController.ensureSequelizeInstance,doctorController.getPaginatedDoctors);
// router.get('/hospital-group/:hospitalGroupId', authenticate,hospitalController.ensureSequelizeInstance, doctorController.getDoctorsByHospitalGroupId);

module.exports = router;
