const express = require('express');
const router = express.Router();
const servicePriceController = require('../controllers/Service_Price_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');
const Userverifiction = require('../validators/Accesstokenverify');


router.post('/service-Price', validateService.validateServicePriceList,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,servicePriceController.createServicePriceList);
router.get('/service-Price', authenticate,Userverifiction,ensureSequelizeInstance,servicePriceController.getAllServicePriceLists);
router.get('/service-Price/:service_price_id', authenticate,Userverifiction,ensureSequelizeInstance,servicePriceController.getServicePriceListById);
router.put('/service-Price/:service_price_id', validateService.validateServicePriceList,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,servicePriceController.updateServicePriceList);
router.delete('/service-Price/:service_price_id', validateService.validateServicePriceList,authenticate,Userverifiction,ensureSequelizeInstance,servicePriceController.deleteServicePriceList);


module.exports = router;
