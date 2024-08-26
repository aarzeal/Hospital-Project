const sequelize = require('../database/connection'); // Ensure correct path

console.log('Sequelize instance:', sequelize); // Debugging

exports.getCountries = async (req, res) => {
    try {
      console.log('Attempting to fetch countries...');
      const countries = await sequelize.query("SELECT * FROM countries", {
        type: sequelize.QueryTypes.SELECT,
      });
      console.log('Countries fetched successfully:', countries);
      res.status(200).json({ success: true, data: countries });
    } catch (error) {
      console.error('Error fetching countries:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching countries', error: error.message });
    }
  };
  
  // Get states and cities by countryId
  exports.getStatesAndCitiesByCountry = async (req, res) => {
    try {
      const { countryId } = req.params;
  
      // Query to get states and cities for the given countryId
      const query = `
        SELECT 
          states.id AS stateId, 
          states.statesName AS stateName, 
          cities.id AS cityId, 
          cities.cityName AS cityName
        FROM states
        LEFT JOIN cities ON states.id = cities.stateId
        WHERE states.countryId = ?
      `;
  
      const statesAndCities = await sequelize.query(query, {
        replacements: [countryId],
        type: sequelize.QueryTypes.SELECT,
      });
  
      // Group the results by state
      const result = statesAndCities.reduce((acc, row) => {
        const { stateId, stateName, cityId, cityName } = row;
        if (!acc[stateId]) {
          acc[stateId] = {
            stateId,
            stateName,
            cities: []
          };
        }
        if (cityId) {
          acc[stateId].cities.push({
            cityId,
            cityName
          });
        }
        return acc;
      }, {});
  
      res.status(200).json({ success: true, data: Object.values(result) });
    } catch (error) {
      console.error('Error fetching states and cities:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching states and cities', error: error.message });
    }
  };

// Get states by countryId
exports.getStatesOrCities = async (req, res) => {
    try {
      const { stateId } = req.params;
  
      if (stateId) {
        // If stateId is provided, fetch cities for that state
        const cities = await sequelize.query("SELECT * FROM cities WHERE stateId = ?", {
          replacements: [stateId],
          type: sequelize.QueryTypes.SELECT,
        });
  
        if (cities.length > 0) {
          res.status(200).json({ success: true, data: cities });
        } else {
          res.status(404).json({ success: false, message: 'No cities found for this state' });
        }
      } else {
        // If no stateId is provided, fetch all states
        const states = await sequelize.query("SELECT * FROM states", {
          type: sequelize.QueryTypes.SELECT,
        });
        res.status(200).json({ success: true, data: states });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching data', error });
    }
  };

// Get cities by stateId
exports.getAllCities = async (req, res) => {
    try {
      const cities = await sequelize.query("SELECT * FROM cities", {
        type: sequelize.QueryTypes.SELECT,
      });
      res.status(200).json({ success: true, data: cities });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching cities', error });
    }
  };
  
  // Get city details by cityId, including state and country information
  exports.getCityDetails = async (req, res) => {
    try {
      const { cityId } = req.params;
  
      const query = `
        SELECT cities.*, states.statesName AS stateName, countries.countryName AS countryName
        FROM cities
        JOIN states ON cities.stateId = states.id
        JOIN countries ON states.countryId = countries.id
        WHERE cities.id = ?
      `;
  
      const cityDetails = await sequelize.query(query, {
        replacements: [cityId],
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (cityDetails.length > 0) {
        res.status(200).json({ success: true, data: cityDetails[0] });
      } else {
        res.status(404).json({ success: false, message: 'City not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching city details', error });
    }
  };