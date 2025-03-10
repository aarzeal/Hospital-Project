const express = require('express');
const router = express.Router();
const itemGroupController = require('../controllers/ItemGroupController.js');
const authenticate = require('../validators/authenticate.js');
const userverifiction = require('../validators/Accesstokenverify.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
// const validator = require('../validators/TaxValidators.js')



router.post('/itemGroup', validateJSONContentType,authenticate,userverifiction,ensureSequelizeInstance,itemGroupController.createItemGroup);
router.get('/itemGroup', authenticate,userverifiction,ensureSequelizeInstance,itemGroupController.getAllItemGroup);
router.get('/itemGroup/:Item_Group_id', authenticate,userverifiction,ensureSequelizeInstance,itemGroupController.getItemGroupById);
router.delete('/itemGroup/:Item_Group_id', authenticate,userverifiction,ensureSequelizeInstance,itemGroupController.deleteItemGroup);
router.put('/itemGroup/:Item_Group_id',validateJSONContentType,userverifiction, authenticate,ensureSequelizeInstance,itemGroupController.updateItemGroup);

module.exports = router;
