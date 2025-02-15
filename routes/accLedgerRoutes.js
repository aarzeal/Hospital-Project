
const express = require('express');
const router = express.Router();
const accLedgerController = require('../controllers/accLedgerController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');

router.post('/acc-Ledger', validateJSONContentType,authenticate,ensureSequelizeInstance,accLedgerController.createAccLedger);
router.get('/acc-Ledger', authenticate,ensureSequelizeInstance,accLedgerController.getAccLedger);
router.get('/acc-Ledger/:id', authenticate,ensureSequelizeInstance,accLedgerController.getAccLedgerById);
router.delete('/acc-Ledger-delete/:id', authenticate,ensureSequelizeInstance,accLedgerController.deleteAccLedger);
router.put('/acc-Ledger-update/:id',validateJSONContentType, authenticate,ensureSequelizeInstance,accLedgerController.updateAccLedger);

module.exports = router;
