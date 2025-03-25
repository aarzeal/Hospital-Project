const express = require('express');
const router = express.Router();
const wardcontroller = require('../controllers/wardCotroller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax  = require('../validators/TaxValidators');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create_ward', validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,wardcontroller.createWard);
router.get('/get_ward', authenticate,Userverifiction,ensureSequelizeInstance,wardcontroller.getward);
router.get('/get_ward/:ward_ID', authenticate,Userverifiction,ensureSequelizeInstance,wardcontroller.getWardById);
router.put('/put_ward/:ward_ID', authenticate,Userverifiction,ensureSequelizeInstance,wardcontroller.updateWard);
router.delete('/delete_ward/:ward_ID', authenticate,Userverifiction,ensureSequelizeInstance,wardcontroller.deleteWard);

module.exports = router;
