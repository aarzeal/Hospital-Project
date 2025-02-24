
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/Item_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

router.post('/create-Item', validateJSONContentType,authenticate,ensureSequelizeInstance,itemController.createItem);
router.get('/get-Item', authenticate,ensureSequelizeInstance,itemController.getItem);
router.get('/get-Item/:id', authenticate,ensureSequelizeInstance,itemController.getItemId);
// router.delete('/acc-Ledger-delete/:id', authenticate,ensureSequelizeInstance,accLedgerController.deleteAccLedger);
// router.put('/acc-Ledger-update/:id',validateJSONContentType, validator.validateAccLedgerUpdate,authenticate,ensureSequelizeInstance,accLedgerController.updateAccLedger);

module.exports = router;
