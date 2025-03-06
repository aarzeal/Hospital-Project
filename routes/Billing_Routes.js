
const express = require('express');
const router = express.Router();
const billing_Controller = require('../controllers/Billing_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

router.post('/billing', validateJSONContentType,authenticate,ensureSequelizeInstance,validator.validateBillingClass,billing_Controller.createBillingClass);
router.get('/billing', authenticate,ensureSequelizeInstance,billing_Controller.getAllBillingClasses);
router.get('/billing/:id', authenticate,ensureSequelizeInstance,billing_Controller.getBillingClassById);
router.delete('/billing-delete/:id', authenticate,ensureSequelizeInstance,billing_Controller.deleteBillingClass);
router.put('/billing-update/:id',validateJSONContentType,authenticate,ensureSequelizeInstance,validator.validateBillingClassUpdate,billing_Controller.updateBillingClass);

module.exports = router;
