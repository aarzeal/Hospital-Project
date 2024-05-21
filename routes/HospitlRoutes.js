const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/HospitalController');
const { createHospitalValidationRules, updateHospitalValidationRules } = require('../validators/hospitalValidator');

router.post('/hospital', createHospitalValidationRules(), hospitalController.createHospital);
router.get('/hospital', hospitalController.getAllHospitals);
router.get('/hospital/:id', hospitalController.getHospitalById);
router.put('/hospital/:id', updateHospitalValidationRules(), hospitalController.updateHospital);
router.delete('/hospital/:id', hospitalController.deleteHospital);

module.exports = router;
