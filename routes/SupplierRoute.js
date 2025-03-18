
const express = require('express');
const router = express.Router();
const supplier = require('../controllers/SupplierController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');


const validator = require('../validators/TaxValidators')
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create-supplier', validateJSONContentType,validator.validateSupplier,authenticate,Userverifiction,ensureSequelizeInstance,supplier.createSupplier);
router.get('/get-supplier',authenticate, Userverifiction,ensureSequelizeInstance,supplier.getSuppliers);
router.get('/get-supplier/:supplier_ID',authenticate, Userverifiction,ensureSequelizeInstance,supplier.getSupplierById);
router.delete('/delete-supplier/:supplier_ID',authenticate, Userverifiction,ensureSequelizeInstance,supplier.deleteSupplier);
router.put('/update-supplier/:supplier_ID',validateJSONContentType,validator.validateSupplierUpdate,authenticate, Userverifiction,ensureSequelizeInstance,supplier.updateSupplier);

module.exports = router;
