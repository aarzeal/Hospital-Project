
const express = require('express');
const router = express.Router();
const accLedgerController = require('../controllers/accLedgerController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/acc-Ledger', validateJSONContentType,validator.validateAccLedger,authenticate,Userverifiction,ensureSequelizeInstance,accLedgerController.createAccLedger);
router.get('/acc-Ledger', authenticate,Userverifiction,ensureSequelizeInstance,accLedgerController.getAccLedger);
router.get('/acc-Ledger/:id', authenticate,Userverifiction,ensureSequelizeInstance,accLedgerController.getAccLedgerById);
router.delete('/acc-Ledger-delete/:id', authenticate,Userverifiction,ensureSequelizeInstance,accLedgerController.deleteAccLedger);
router.put('/acc-Ledger-update/:id',validateJSONContentType, validator.validateAccLedgerUpdate,authenticate,Userverifiction,ensureSequelizeInstance,accLedgerController.updateAccLedger);

module.exports = router;
