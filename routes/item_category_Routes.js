const express = require('express');
const router = express.Router();
const itemCategoryController = require('../controllers/Item_category_Controller.js');
const authenticate = require('../validators/authenticate.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.json');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
const validator = require('../validators/TaxValidators.js')



router.post('/create-Item-category', validateJSONContentType,validator.validateItem,authenticate,ensureSequelizeInstance,itemCategoryController.createItem);
router.get('/get-Item-category', authenticate,ensureSequelizeInstance,itemCategoryController.getItemcategory);
router.get('/get-Item-category/:id', authenticate,ensureSequelizeInstance,itemCategoryController.getItemId);
router.delete('/delete-Item-category/:id', authenticate,ensureSequelizeInstance,itemCategoryController.deleteItem);
router.put('/update-Item-category/:id',validateJSONContentType,validator.validateItemupdate, authenticate,ensureSequelizeInstance,itemCategoryController.updateItem);

module.exports = router;




