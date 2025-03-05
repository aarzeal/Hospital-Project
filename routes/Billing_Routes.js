
const express = require('express');
const router = express.Router();
const billing_Controller = require('../controllers/Billing_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

router.post('/billing', validateJSONContentType,authenticate,ensureSequelizeInstance,billing_Controller.createBillingClass);
// router.get('/acc-Ledger', authenticate,ensureSequelizeInstance,billing_Controller.getAccLedger);
// router.get('/acc-Ledger/:id', authenticate,ensureSequelizeInstance,billing_Controller.getAccLedgerById);
// router.delete('/acc-Ledger-delete/:id', authenticate,ensureSequelizeInstance,billing_Controller.deleteAccLedger);
// router.put('/acc-Ledger-update/:id',validateJSONContentType,Update,authenticate,ensureSequelizeInstance,billing_Controller.updateAccLedger);

module.exports = router;
