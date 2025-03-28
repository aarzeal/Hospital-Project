const express = require('express');
const router = express.Router();
const wardwcacontroller = require('../controllers/wardwiseCAcontroller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax = require('../validators/TaxValidators');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create_wardwca', validateJSONContentType, authenticate, Userverifiction, ensureSequelizeInstance, wardwcacontroller.createWwca);
router.get('/get_wardwca', authenticate, Userverifiction, ensureSequelizeInstance, wardwcacontroller.getWwca);
router.get('/get_wardwca/:Wwca_ID', authenticate, Userverifiction, ensureSequelizeInstance, wardwcacontroller.getWwcaById);
router.put('/put_wardwca/:Wwca_ID', authenticate,Userverifiction,ensureSequelizeInstance,wardwcacontroller.updateWwcaById);
router.delete('/delete_wardwca/:Wwca_ID', authenticate,Userverifiction,ensureSequelizeInstance,wardwcacontroller.deleteWwcaById);

module.exports = router;
