const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const authenticate = require('../Middleware/verifyAccesstoken'); // Adjust path as needed
const hospitalController = require('../controllers/HospitalController');

router.get('/designations', authenticate,hospitalController.ensureSequelizeInstance, designationController.getAllDesignations);
router.get('/designations/:id', authenticate,hospitalController.ensureSequelizeInstance, designationController.getDesignationById);
router.post('/designations', authenticate,hospitalController.ensureSequelizeInstance, designationController.createDesignation);
router.put('/designations/:id', authenticate,hospitalController.ensureSequelizeInstance, designationController.updateDesignation);
router.delete('/designations/:id', authenticate, hospitalController.ensureSequelizeInstance,designationController.deleteDesignation);
router.get('/paginated', authenticate, hospitalController.ensureSequelizeInstance,designationController.getPaginatedDesignations);

module.exports = router;

