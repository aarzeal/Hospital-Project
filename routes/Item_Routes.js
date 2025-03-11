
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/Item_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/TaxValidators')
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/create-Item', validateJSONContentType,validator.validateItem,Userverifiction,ensureSequelizeInstance,itemController.createItem);
router.get('/get-Item', Userverifiction,ensureSequelizeInstance,itemController.getItem);
router.get('/get-Item/:id', Userverifiction,ensureSequelizeInstance,itemController.getItemId);
router.delete('/delete-Item/:id', Userverifiction,ensureSequelizeInstance,itemController.deleteItem);
router.put('/update-Item/:id',validateJSONContentType,validator.validateItemupdate, Userverifiction,ensureSequelizeInstance,itemController.updateItem);

module.exports = router;
