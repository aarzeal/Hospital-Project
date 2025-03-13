const express = require('express');
const router = express.Router();
const itemCategoryController = require('../controllers/Item_category_Controller.js');
const authenticate = require('../validators/authenticate.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
const validator = require('../validators/TaxValidators.js')
const Userverifiction = require('../validators/Accesstokenverify');



router.post('/create-Item-category', validateJSONContentType,validator.validateItemCategory,authenticate,Userverifiction,ensureSequelizeInstance,itemCategoryController.createItemCategory);
router.get('/get-Item-category', authenticate,Userverifiction,ensureSequelizeInstance,itemCategoryController.getAllItemCategories);
router.get('/get-Item-category/:id', authenticate,Userverifiction,ensureSequelizeInstance,itemCategoryController.getItemCategoryById);
router.delete('/delete-Item-category/:id', authenticate,Userverifiction,ensureSequelizeInstance,itemCategoryController.deleteItemCategory);
router.put('/update-Item-category/:id',validateJSONContentType,validator.validateItemCategoryUpdate, authenticate,Userverifiction,ensureSequelizeInstance,itemCategoryController.updateItemCategory);

module.exports = router;




