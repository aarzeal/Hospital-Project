const express = require('express');
const router = express.Router();
const itemCategoryController = require('../controllers/Item_category_Controller.js');
const authenticate = require('../validators/authenticate.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
// const validator = require('../validators/TaxValidators.js')



router.post('/create-Item-category', validateJSONContentType,authenticate,ensureSequelizeInstance,itemCategoryController.createItemCategory);
router.get('/get-Item-category', authenticate,ensureSequelizeInstance,itemCategoryController.getAllItemCategories);
router.get('/get-Item-category/:id', authenticate,ensureSequelizeInstance,itemCategoryController.getItemCategoryById);
router.delete('/delete-Item-category/:id', authenticate,ensureSequelizeInstance,itemCategoryController.deleteItemCategory);
router.put('/update-Item-category/:id',validateJSONContentType, authenticate,ensureSequelizeInstance,itemCategoryController.updateItemCategory);

module.exports = router;




