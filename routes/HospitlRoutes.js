const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/HospitalController');
const { createHospitalValidationRules, updateHospitalValidationRules } = require('../validators/hospitalValidator');
const { verifyToken } = require('../Middleware/authMiddleware');

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
router.post('/hospital/login',verifyToken(['admin']), hospitalController.login);

module.exports = router;
