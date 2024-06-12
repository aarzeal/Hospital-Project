const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/HospitalController');
const { createHospitalValidationRules, updateHospitalValidationRules } = require('../validators/hospitalValidator');
const { verifyToken } = require('../Middleware/authMiddleware');
const authenticate = require('../validators/authenticate');

// router.post('/hospital', verifyToken(['admin']),createHospitalValidationRules(), hospitalController.createHospital);
// router.get('/hospital',verifyToken(['admin']), hospitalController.getAllHospitals);
// router.get('/hospital/:id', verifyToken(['admin']),hospitalController.getHospitalById);
// router.get('/hospital/group/:HospitalGroupIDR', verifyToken(['admin']),hospitalController.getHospitalsByHospitalGroupID);
// router.put('/hospital/:id', verifyToken(['admin']),updateHospitalValidationRules(), hospitalController.updateHospital);
// router.delete('/hospital/:id',verifyToken(['admin']), hospitalController.deleteHospital);



router.post('/hospital', verifyToken(['admin']), hospitalController.createHospital);
router.get('/hospital',verifyToken(['admin']), hospitalController.getAllHospitals);
router.get('/hospital/:id', verifyToken(['admin']),hospitalController.getHospitalById);
router.get('/hospital/group/:HospitalGroupIDR', verifyToken(['admin']),hospitalController.getHospitalsByHospitalGroupID);
router.put('/hospital/:id', verifyToken(['admin']),updateHospitalValidationRules(), hospitalController.updateHospital);
router.delete('/hospital/:id',verifyToken(['admin']), hospitalController.deleteHospital);
router.post('/hospital/login', hospitalController.login);


router.post('/hospital/user', hospitalController.createUser);


  router.post('/create-user', authenticate, hospitalController.ensureSequelizeInstance, hospitalController.createUser);
  router.get('/user/:id', authenticate, hospitalController.ensureSequelizeInstance, hospitalController.getUser);
router.put('/user/:id', authenticate, hospitalController.ensureSequelizeInstance, hospitalController.updateUser);
router.delete('/user/:id', authenticate, hospitalController.ensureSequelizeInstance, hospitalController.deleteUser);
router.get('/users', authenticate, hospitalController.ensureSequelizeInstance, hospitalController.getAllUsers);
//   router.post('/create-user', hospitalController.ensureSequelizeInstance, hospitalController.createUser);
  



















module.exports = router;
