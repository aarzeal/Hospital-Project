const express = require('express');
const router = express.Router();
const TaxController = require('../controllers/Tax_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax  = require('../validators/TaxValidators');

router.post('/create_tax', validateJSONContentType,validateTax.validateTax,authenticate,ensureSequelizeInstance,TaxController.createTax);
router.get('/get_tax', authenticate,ensureSequelizeInstance,TaxController.gettax);
router.get('/get_tax/:id', authenticate,ensureSequelizeInstance,TaxController.getTaxById);
router.put('/update_tax/:id', authenticate,ensureSequelizeInstance,validateTax.validateTaxupdate,TaxController.updateTax);
router.delete('/delete_tax/:id', authenticate,ensureSequelizeInstance,TaxController.deleteTax);

module.exports = router;
