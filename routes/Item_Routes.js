
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/Item_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/TaxValidators')

router.post('/create-Item', validateJSONContentType,validator.validateItem,authenticate,ensureSequelizeInstance,itemController.createItem);
router.get('/get-Item', authenticate,ensureSequelizeInstance,itemController.getItem);
router.get('/get-Item/:id', authenticate,ensureSequelizeInstance,itemController.getItemId);
router.delete('/delete-Item/:id', authenticate,ensureSequelizeInstance,itemController.deleteItem);
router.put('/update-Item/:id',validateJSONContentType,validator.validateItemupdate, authenticate,ensureSequelizeInstance,itemController.updateItem);

module.exports = router;
