
const express = require('express');
const router = express.Router();
const billing_Controller = require('../controllers/Billing_Controller');
const authenticate = require('../validators/authenticate');
const Userverifiction = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

router.post('/billing', validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,validator.validateBillingClass,billing_Controller.createBillingClass);
router.get('/billing', authenticate,ensureSequelizeInstance,Userverifiction,billing_Controller.getAllBillingClasses);
router.get('/billing/:id', authenticate,Userverifiction,ensureSequelizeInstance,billing_Controller.getBillingClassById);
router.delete('/billing-delete/:id', authenticate,Userverifiction,ensureSequelizeInstance,billing_Controller.deleteBillingClass);
router.put('/billing-update/:id',validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,validator.validateBillingClassUpdate,billing_Controller.updateBillingClass);

module.exports = router;
