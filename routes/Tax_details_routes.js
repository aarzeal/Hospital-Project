const express = require('express');
const router = express.Router();
const Tax_Details_Controller = require('../controllers/Tax_details_controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/TaxValidators');

router.post('/create_tax_details', validateJSONContentType,validator.validateTaxDetails ,authenticate,ensureSequelizeInstance,Tax_Details_Controller.createTaxDetails);
router.get('/get_tax_details', authenticate,ensureSequelizeInstance,Tax_Details_Controller.getAllTaxDetails);
router.get('/get_tax_details/:id', authenticate,ensureSequelizeInstance,Tax_Details_Controller.getTaxDetailsById);
router.put('/put_tax_details/:id', authenticate, validator.validateTaxDetailsupdate,ensureSequelizeInstance,Tax_Details_Controller.updateTaxDetails);
router.delete('/delete_tax_details/:id', authenticate,ensureSequelizeInstance,Tax_Details_Controller.deleteTaxDetails);


module.exports = router;