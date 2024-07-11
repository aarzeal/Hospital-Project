const express = require('express');
const router = express.Router();
// const { check } = require('express-validator');
const staffController = require('../controllers/staffController');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const authenticate = require('../Middleware/verifyAccesstoken');
const { createStaffValidationRules, updateStaffValidationRules } = require('../validators/hospitalValidator');
const hospitalController = require('../controllers/HospitalController');



// Routes
router.post('/create-staff', authenticate,createStaffValidationRules(), validateJSONContentType, hospitalController.ensureSequelizeInstance,staffController.createStaff);
router.get('/staff/:id',authenticate, hospitalController.ensureSequelizeInstance,staffController.getStaffById);
router.put('/staff/:id', authenticate,updateStaffValidationRules(), validateJSONContentType,hospitalController.ensureSequelizeInstance,staffController.updateStaff);
router.delete('/staff/:id', authenticate,hospitalController.ensureSequelizeInstance,staffController.deleteStaff);
// router.get('/staff/hospital/:hospitalID', authenticate,staffController.getStaffMembersByHospitalID);
// router.get('/staff/hospitalGroup/:hospitalGroupID',authenticate, staffController.getStaffMembersByHospitalGroupID);
router.get('/staff/',authenticate, hospitalController.ensureSequelizeInstance,staffController.getAllStaff);
router.get('/hospitalId/:hospitalId', authenticate,hospitalController.ensureSequelizeInstance, staffController.getStaffByHospitalIDR);
// router.get('/hospital-group/:hospitalGroupId', authenticate, hospitalController.ensureSequelizeInstance,staffController.getStaffByHospitalGroupId);


module.exports = router;
