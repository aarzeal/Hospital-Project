

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/authMiddleware');


const validateJSONContentType = require('../Middleware/jsonvalidation');

const hospitalGroupController = require('../controllers/hospitalGroupController');

router.post('/admin/login', hospitalGroupController.loginValidationRules(),hospitalGroupController.login,)

router.post('/hospital-groups',verifyToken(['admin']),  validateJSONContentType,hospitalGroupController.createHospitalGroup);
router.get('/hospital-groups',verifyToken(['admin']),   hospitalGroupController.getAllHospitalGroups);
router.get('/hospital-groups/:id',verifyToken(['admin']),   hospitalGroupController.getHospitalGroupById);
router.put('/hospital-groups/:id', verifyToken(['admin']),  validateJSONContentType,hospitalGroupController.updateHospitalGroup);
router.delete('/hospital-groups/:id',verifyToken(['admin']),   hospitalGroupController.deleteHospitalGroup);
router.get('/hospital-groups', hospitalGroupController.getAllHospitalGroupsByPagination);

module.exports = router;
