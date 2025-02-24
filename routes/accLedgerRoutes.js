
const express = require('express');
const router = express.Router();
const accLedgerController = require('../controllers/accLedgerController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

router.post('/acc-Ledger', validateJSONContentType,validator.validateAccLedger,authenticate,ensureSequelizeInstance,accLedgerController.createAccLedger);
router.get('/acc-Ledger', authenticate,ensureSequelizeInstance,accLedgerController.getAccLedger);
router.get('/acc-Ledger/:id', authenticate,ensureSequelizeInstance,accLedgerController.getAccLedgerById);
router.delete('/acc-Ledger-delete/:id', authenticate,ensureSequelizeInstance,accLedgerController.deleteAccLedger);
router.put('/acc-Ledger-update/:id',validateJSONContentType, validator.validateAccLedgerUpdate,authenticate,ensureSequelizeInstance,accLedgerController.updateAccLedger);

module.exports = router;
