const express = require('express');
const router = express.Router();
const itemGroupController = require('../controllers/ItemGroupController.js');
const authenticate = require('../validators/authenticate.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
// const validator = require('../validators/TaxValidators.js')



router.post('/itemGroup', validateJSONContentType,authenticate,ensureSequelizeInstance,itemGroupController.createItemGroup);
router.get('/itemGroup', authenticate,ensureSequelizeInstance,itemGroupController.getAllItemGroup);
router.get('/itemGroup/:Item_Group_id', authenticate,ensureSequelizeInstance,itemGroupController.getItemGroupById);
router.delete('/itemGroup/:Item_Group_id', authenticate,ensureSequelizeInstance,itemGroupController.deleteItemGroup);
router.put('/itemGroup/:Item_Group_id',validateJSONContentType, authenticate,ensureSequelizeInstance,itemGroupController.updateItemGroup);

module.exports = router;
