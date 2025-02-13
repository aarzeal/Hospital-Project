const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/service_category');

router.post('/service-category', serviceCategoryController.createServiceCategory);
// router.get('/service-category', serviceCategoryController.getAllServiceCategories);
// router.get('/service-category/:id', serviceCategoryController.getServiceCategoryById);
// router.put('/service-category/:id', serviceCategoryController.updateServiceCategory);

module.exports = router;
