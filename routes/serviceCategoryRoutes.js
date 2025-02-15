const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/service_category');
const ensureSequelizeInstance = require('../util/databasedyanamic');

const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
router.post('/service-category', validateJSONContentType,authenticate,ensureSequelizeInstance,serviceCategoryController.createServiceCategory);
router.get('/service-category', authenticate,ensureSequelizeInstance,serviceCategoryController.getServiceCategories);
router.put('/service-categories/:servicecategoryId', validateJSONContentType,authenticate,ensureSequelizeInstance,serviceCategoryController.updateServiceCategory);
router.delete('/service-categories/:servicecategoryId', authenticate,ensureSequelizeInstance,serviceCategoryController.deleteServiceCategory);

module.exports = router;
