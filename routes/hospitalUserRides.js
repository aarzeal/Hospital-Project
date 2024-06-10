const express = require('express');
const router = express.Router();
const userRidesController = require('../controllers/hopsitalUserRides');

// Define routes for user rides
router.post('/user-rides', userRidesController.createUserRide);
router.get('/user-rides', userRidesController.getAllUserRides);
router.put('/user-rides/:id', userRidesController.updateUserRide);
router.get('/user/:userId/submodule-names', userRidesController.fetchSubmoduleNames);
router.get('/modules/:userId', userRidesController.fetchModuleAndSubmoduleNames);

module.exports = router;
