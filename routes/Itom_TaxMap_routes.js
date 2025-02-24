const express = require('express');
const router = express.Router();
const Tax_map_Controller = require('../controllers/Itom_TaxMap_controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');

router.post('/create_tax_map', validateJSONContentType,authenticate,ensureSequelizeInstance,Tax_map_Controller.createTaxDetails);
router.get('/get_tax_map', authenticate,ensureSequelizeInstance,Tax_map_Controller.getAllTaxDetails);
router.get('/get_tax_map/:id', authenticate,ensureSequelizeInstance,Tax_map_Controller.getTaxDetailsById);
router.put('/put_tax_map/:id', authenticate,ensureSequelizeInstance,Tax_map_Controller.updateTaxDetails);
router.delete('/delete_tax_map/:id', authenticate,ensureSequelizeInstance,Tax_map_Controller.deleteTaxDetails);


module.exports = router;