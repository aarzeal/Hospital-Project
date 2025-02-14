const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/service_category');
const authenticate = require('../validators/authenticate');

router.post('/service-category', authenticate,serviceCategoryController.ensureSequelizeInstance,serviceCategoryController.createServiceCategory);
router.get('/service-category', authenticate,serviceCategoryController.ensureSequelizeInstance,serviceCategoryController.getServiceCategories);
router.get('/service-categories/:id', authenticate,serviceCategoryController.ensureSequelizeInstance,serviceCategoryController.updateServiceCategory);

module.exports = router;
