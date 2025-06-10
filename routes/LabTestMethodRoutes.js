const express = require('express');
const router = express.Router();
const controller = require('../controllers/LabTestMethodController');
const authenticate = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');

router.post('/create-lab-test-method', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification,  controller.createLabTestMethod);
router.get('/all-lab-test-method', authenticate, ensureSequelizeInstance, Userverification, controller.getAllLabTestMethod);
router.get("/lab-test-method/:id", authenticate, ensureSequelizeInstance, Userverification, controller.getLabTestMethodById);
router.put('/update-lab-test-method/:lab_test_method_id', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.updateLabTestMethodById);
router.delete("/delete-lab-test-method/:lab_test_method_id", authenticate, ensureSequelizeInstance, Userverification, controller.deleteLabTestMethodById);
router.get('/as-per-query-param',authenticate,ensureSequelizeInstance,Userverification,controller.getCustomDataAsPerQueryParam);

module.exports = router;