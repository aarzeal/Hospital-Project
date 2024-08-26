const express = require('express');
const router = express.Router();
const locationController = require('../controllers/CountryStateCityController');

// Route to get all countries
router.get('/countries', locationController.getCountries);

// Route to get states by countryId
router.get('/states/:stateId?', locationController.getStatesOrCities);

// Route to get cities by stateId
// router.get('/cities/:stateId', locationController.getCities);

router.get('/cities', locationController.getAllCities);

// Route to get city details by cityId
router.get('/cities/:cityId', locationController.getCityDetails);
// router.get('/countries', locationController.getCountries);

// Route to get states and cities by countryId
router.get('/countries/:countryId?', locationController.getStatesAndCitiesByCountry);



module.exports = router;
