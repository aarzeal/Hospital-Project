const express = require("express");
const router = express.Router();
const appointmentSchedule_Controller = require("../controllers/AppointmentSchedule_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
//const validateTax = require('../validators/TaxValidators');
const Userverification = require('../validators/Accesstokenverify');
const validation = require("../validators/validation")

router.post('/Appointment-Schedule', validateJSONContentType, authenticate, Userverification, ensureSequelizeInstance,validation.registerAppointmentSchedule, appointmentSchedule_Controller.register_Appointment_Schedule);
router.get('/Appointment-Schedule', authenticate, Userverification, ensureSequelizeInstance, appointmentSchedule_Controller.getallAppointmentSchedule);
router.get('/Appointment-Schedule/:AppointmentSchedule_Id', authenticate, Userverification, ensureSequelizeInstance, appointmentSchedule_Controller.getAppointmentScheduleById);
router.put('/Appointment-Schedule/:AppointmentSchedule_Id', validateJSONContentType, Userverification, authenticate, ensureSequelizeInstance, validation.updateAppointmentSchedule, appointmentSchedule_Controller.updateappointmentScheduleById);
router.delete('/Appointment-Schedule/:AppointmentSchedule_Id', authenticate, Userverification, ensureSequelizeInstance, appointmentSchedule_Controller.deleteAppointmentScheduleById);

module.exports = router;
