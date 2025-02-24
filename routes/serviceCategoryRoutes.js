const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/service_category');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')

const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
router.post('/service-category', validateJSONContentType,validator.validateServiceCategory,authenticate,ensureSequelizeInstance,serviceCategoryController.createServiceCategory);
router.get('/service-category', authenticate,ensureSequelizeInstance,serviceCategoryController.getServiceCategories);
router.put('/service-categories/:servicecategoryId', validateJSONContentType,validator.validateServiceCategoryupdate,authenticate,ensureSequelizeInstance,serviceCategoryController.updateServiceCategory);
router.delete('/service-categories/:servicecategoryId', authenticate,ensureSequelizeInstance,serviceCategoryController.deleteServiceCategory);

module.exports = router;
