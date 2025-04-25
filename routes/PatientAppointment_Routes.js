const express = require("express");
const patient_Appointment = require("../controllers/PatientAppointment_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
//const validation = require("../validators/validation");

const router = express.Router();
router.post('/patient-appointment', validateJSONContentType, authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.create_Patient_Appointment);
router.get('/patient-appointment', authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.getallpatientAppointments);
router.get('/patient-appointment/:appointment_ID', authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.getPatientAppointmentById);
router.put('/patient-appointment/:appointment_ID', validateJSONContentType, Userverification, authenticate, ensureSequelizeInstance,patient_Appointment.update_Patient_Appointment_By_Id);
router.delete('/patient-appointment/:appointment_ID', authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.deletePatientAppointmentById);
router.get("/doctor/:employee_IDR", authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.getAppointmentsByDoctorId);
router.get('/Appointment/:employee_IDR', authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.getAppointmentsByDoctor);
//router.get("/patient-appointment/:employee_IDR/filter", authenticate, Userverification, ensureSequelizeInstance, patient_Appointment.getAppointmentsByDoctorAndDateRange);


module.exports=router;