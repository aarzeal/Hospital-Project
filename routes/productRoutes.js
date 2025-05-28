const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const  authenticate  = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');


router.post('/product',authenticate,ensureSequelizeInstance, controller.createProduct);
router.get('/products',authenticate,ensureSequelizeInstance, controller.getAllProducts);
router.get('/ResAsPerQueryColumn', authenticate,ensureSequelizeInstance, controller.getProductAsPerQueryParam);


module.exports = router;
