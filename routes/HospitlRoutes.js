const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/HospitalController');
const { createHospitalValidationRules, updateHospitalValidationRules,createUserValidationRules } = require('../validators/hospitalValidator');
const { verifyToken } = require('../Middleware/authMiddleware');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');

// router.post('/hospital', verifyToken(['admin']),createHospitalValidationRules(), hospitalController.createHospital);
// router.get('/hospital',verifyToken(['admin']), hospitalController.getAllHospitals);
// router.get('/hospital/:id', verifyToken(['admin']),hospitalController.getHospitalById);
// router.get('/hospital/group/:HospitalGroupIDR', verifyToken(['admin']),hospitalController.getHospitalsByHospitalGroupID);
// router.put('/hospital/:id', verifyToken(['admin']),updateHospitalValidationRules(), hospitalController.updateHospital);
// router.delete('/hospital/:id',verifyToken(['admin']), hospitalController.deleteHospital);



router.post('/hospital', verifyToken(['admin']),createHospitalValidationRules(),  validateJSONContentType, hospitalController.createHospital);
router.get('/hospital',verifyToken(['admin']),  validateJSONContentType, hospitalController.getAllHospitals);
router.get('/hospital/:id', verifyToken(['admin']),  validateJSONContentType,hospitalController.getHospitalById);
router.get('/hospital/group/:HospitalGroupIDR', verifyToken(['admin']),  validateJSONContentType,hospitalController.getHospitalsByHospitalGroupID);
router.put('/hospital/:id', verifyToken(['admin']),updateHospitalValidationRules(),  validateJSONContentType, hospitalController.updateHospital);
router.delete('/hospital/:id',verifyToken(['admin']),  validateJSONContentType, hospitalController.deleteHospital);
router.get('/hospitals', hospitalController.getAllHospitalsByPagination);



router.post('/hospital/login', hospitalController.login);

router.post('/request-password-reset', hospitalController.requestPasswordReset);
router.post('/reset-password', hospitalController.resetPassword);
router.post('/change-password', hospitalController.changePassword);
router.post('/change-email', hospitalController.changeEmail);



router.post('/hospital/user', hospitalController.createUser);


  router.post('/create-user', authenticate,createUserValidationRules(), validateJSONContentType,  hospitalController.ensureSequelizeInstance, hospitalController.createUser);
  router.get('/user/:id', authenticate,  hospitalController.ensureSequelizeInstance, hospitalController.getUser);
router.put('/user/:id', createUserValidationRules(),authenticate,   validateJSONContentType,hospitalController.ensureSequelizeInstance, hospitalController.updateUser);
router.delete('/user/:id', authenticate,  hospitalController.ensureSequelizeInstance, hospitalController.deleteUser);
router.get('/users', authenticate,hospitalController.ensureSequelizeInstance, hospitalController.getAllUsers);
//   router.post('/create-user', hospitalController.ensureSequelizeInstance, hospitalController.createUser);
router.get('/verify/:token',authenticate, hospitalController.ensureSequelizeInstance,hospitalController.verifyEmail);
router.get('/users/pagination',authenticate, hospitalController.getAllUsersByPagination);
  



















module.exports = router;
