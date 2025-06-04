const express = require('express');
const router = express.Router();
const controller = require('../controllers/LabTestMethodController');
const  authenticate  = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');


router.post('/labTestMethod', authenticate,ensureSequelizeInstance, controller.createLabTestMethod);
// router.get('/products',authenticate,ensureSequelizeInstance, controller.getAllProducts);
// router.get('/ResAsPerQueryColumn', authenticate,ensureSequelizeInstance, controller.getProductAsPerQueryParam);
// router.put("/product/:product_id", authenticate, ensureSequelizeInstance, controller.updateProduct);


module.exports = router;