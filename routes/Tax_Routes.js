const express = require('express');
const router = express.Router();
const TaxController = require('../controllers/Tax_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax  = require('../validators/TaxValidators');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create_tax', validateJSONContentType,validateTax.validateTax,authenticate,Userverifiction,ensureSequelizeInstance,TaxController.createTax);
router.get('/get_tax', authenticate,Userverifiction,ensureSequelizeInstance,TaxController.gettax);
router.get('/get_tax/:id', authenticate,Userverifiction,ensureSequelizeInstance,TaxController.getTaxById);
router.put('/update_tax/:id', authenticate,Userverifiction,ensureSequelizeInstance,validateTax.validateTaxupdate,TaxController.updateTax);
router.delete('/delete_tax/:id', authenticate,Userverifiction,ensureSequelizeInstance,TaxController.deleteTax);

module.exports = router;
