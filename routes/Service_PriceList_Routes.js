const express = require('express');
const router = express.Router();
const servicePriceController = require('../controllers/Service_Price_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');

router.post('/service-Price', validateService.validateServicePriceList,validateJSONContentType,authenticate,ensureSequelizeInstance,servicePriceController.createServicePriceList);
router.get('/service-Price', authenticate,ensureSequelizeInstance,servicePriceController.getAllServicePriceLists);
router.get('/service-Price/:service_price_id', authenticate,ensureSequelizeInstance,servicePriceController.getServicePriceListById);
router.put('/service-Price/:service_price_id', validateService.validateServicePriceList,validateJSONContentType,authenticate,ensureSequelizeInstance,servicePriceController.updateServicePriceList);
router.delete('/service-Price/:service_price_id', validateService.validateServicePriceList,authenticate,ensureSequelizeInstance,servicePriceController.deleteServicePriceList);


module.exports = router;
