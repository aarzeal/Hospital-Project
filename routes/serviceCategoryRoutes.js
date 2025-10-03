const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/service_category');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')
const Userverifiction = require('../validators/Accesstokenverify');

const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
router.post('/service-category', validateJSONContentType,validator.validateServiceCategory,authenticate,Userverifiction,ensureSequelizeInstance,serviceCategoryController.createServiceCategory);
router.get('/service-category', authenticate,Userverifiction,ensureSequelizeInstance,serviceCategoryController.getServiceCategories);
router.put('/service-categories/:servicecategoryId', validateJSONContentType,validator.validateServiceCategoryupdate,authenticate,Userverifiction,ensureSequelizeInstance,serviceCategoryController.updateServiceCategory);
router.delete('/service-categories/:servicecategoryId', authenticate,Userverifiction,ensureSequelizeInstance,serviceCategoryController.deleteServiceCategory);
router.get('/service-report',authenticate,Userverifiction,ensureSequelizeInstance,serviceCategoryController.getServiceReport);

module.exports = router;
