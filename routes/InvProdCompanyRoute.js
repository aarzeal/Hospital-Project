
const express = require('express');
const router = express.Router();
const itemCompany = require('../controllers/InvProdCompanyController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create-ItemCompany', validateJSONContentType,validator.validateInvProductCompany,authenticate,Userverifiction,ensureSequelizeInstance,itemCompany.createInvProduct);
router.get('/get-ItemCompany',authenticate, Userverifiction,ensureSequelizeInstance,itemCompany.getAllInvProducts);
router.get('/get-ItemCompany/:id',authenticate, Userverifiction,ensureSequelizeInstance,itemCompany.getInvProductById);
router.delete('/delete-ItemCompany/:id',authenticate, Userverifiction,ensureSequelizeInstance,itemCompany.deleteInvProduct);
router.put('/update-ItemCompany/:id',validateJSONContentType,validator.validateInvProductCompanyUpdate,authenticate, Userverifiction,ensureSequelizeInstance,itemCompany.updateInvProduct);

module.exports = router;
