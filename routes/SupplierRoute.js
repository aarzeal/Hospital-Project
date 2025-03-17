
const express = require('express');
const router = express.Router();
const supplier = require('../controllers/SupplierController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/TaxValidators')
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create-supplier', validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,supplier.createSupplier);
router.get('/get-supplier',authenticate, Userverifiction,ensureSequelizeInstance,supplier.getSuppliers);
router.get('/get-supplier/:supplier_ID',authenticate, Userverifiction,ensureSequelizeInstance,supplier.getSupplierById);
// router.delete('/delete-ItemCompany/:id',authenticate, Userverifiction,ensureSequelizeInstance,supplier.deleteInvProduct);
// router.put('/update-ItemCompany/:id',validateJSONContentType,validator.validateItemupdate,authenticate, Userverifiction,ensureSequelizeInstance,supplier.updateInvProduct);

module.exports = router;
