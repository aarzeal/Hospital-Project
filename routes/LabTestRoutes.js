const express = require('express');
const router = express.Router();
const controller = require('../controllers/LabTestController');
const authenticate = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const validation = require('../validators/validation')

router.post('/create-lab-test', authenticate, validation.labTestDetailsCreate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.createLabTest);
router.get('/get-all-lab-test', authenticate, ensureSequelizeInstance, Userverification, controller.getAllLabTest);
router.get('/getById-lab-test/:id', authenticate, ensureSequelizeInstance, Userverification, controller.getLabTestById);
router.put('/update-lab-test/:lab_test_id', authenticate, validation.labTestDetailsCreate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.updateLabTestById);
router.delete('/delete-lab-test/:lab_test_id', authenticate, ensureSequelizeInstance, Userverification, controller.deleteLabTestById);
router.get('/get-labtest-as-per-queryparams', authenticate,ensureSequelizeInstance,Userverification, controller.getLabTestAsPerQueryParam);

module.exports = router;