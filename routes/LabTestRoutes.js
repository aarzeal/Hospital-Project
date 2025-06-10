const express = require('express');
const router = express.Router();
const controller = require('../controllers/LabTestController');
const authenticate = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');

router.post('/create-lab-test', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.createLabTest);
router.get('/get-all-lab-test', authenticate,ensureSequelizeInstance,Userverification,controller.getAllLabTest);
router.get('/getById-lab-test/:id',authenticate,ensureSequelizeInstance,Userverification,controller.getLabTestById);
router.put('/update-lab-test/:lab_test_id', authenticate,validateJSONContentType, ensureSequelizeInstance, Userverification,controller.updateLabTestById);
router.delete('/delete-lab-test/:lab_test_id', authenticate,ensureSequelizeInstance,Userverification,controller.deleteLabTestById);

module.exports = router;