const sequelize = require('../database/connection'); // Ensure correct path

console.log('Sequelize instance:', sequelize); // Debugging
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1094 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

exports.getCountries = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
    try {
      console.log('Attempting to fetch countries...');
      const countries = await sequelize.query("SELECT * FROM countries", {
        type: sequelize.QueryTypes.SELECT,
      });
      console.log('Countries fetched successfully:', countries);
      res.status(200).json({ success: true, data: countries });
    } catch (error) {
      // console.error('Error fetching countries:', error.message);
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1095;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching countries${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      res.status(500).json({ success: false, errorCode: 1095, message: 'Error fetching countries', error: error.message });
    }
  };
  
  // Get states and cities by countryId
  exports.getStatesAndCitiesByCountry = async (req, res) => {
    const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
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
      const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", ` fatched state or city by countries successfull:`, {
        executionTime,
        
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      res.status(200).json({ success: true, data: Object.values(result) });
    } catch (error) {
      // console.error('Error fetching states and cities:', error.message);
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1096;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching states and cities${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      res.status(500).json({ success: false, errorCode: 1096, message: 'Error fetching states and cities', error: error.message });
    }
  };

// Get states by countryId
exports.getStatesOrCities = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
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
          const end = Date.now();
          const executionTime = `${end - start}ms`;
          const errorCode = 1097;
      
          // Log the warning
          logger.logWithMeta("warn", `No cities found for this state${error.message}`, {
            errorCode,
            errorMessage: error.message,
            executionTime,
            hospitalId: req.hospitalId,
      
            ip: clientIp,
            apiName: req.originalUrl, // API name
            method: req.method    ,
            userAgent: req.headers['user-agent'],     // HTTP method
          });
          res.status(404).json({ success: false, errorCode: 1097, message: 'No cities found for this state' });
        }
      } else {
        // If no stateId is provided, fetch all states
        const states = await sequelize.query("SELECT * FROM states", {
          type: sequelize.QueryTypes.SELECT,
        });
        const end = Date.now();
        const executionTime = `${end - start}ms`;
      
        // Log the warning
        logger.logWithMeta("warn", ` fatched state or city successfull:`, {
          executionTime,
          component,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method   ,  
          userAgent: req.headers['user-agent'],    // HTTP method
        });
        res.status(200).json({ success: true, data: states });
      }
    } catch (error) {
      const end = Date.now();
          const executionTime = `${end - start}ms`;
          const errorCode = 1098;
      
          // Log the warning
          logger.logWithMeta("warn", `Error fetching data${error.message}`, {
            errorCode,
            errorMessage: error.message,
            executionTime,
            hospitalId: req.hospitalId,
      
            ip: clientIp,
            apiName: req.originalUrl, // API name
            method: req.method    ,
            userAgent: req.headers['user-agent'],     // HTTP method
          });
      res.status(500).json({ success: false, errorCode: 1098, message: 'Error fetching data', error: error.message });
    }
  };

// Get cities by stateId
exports.getAllCities = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
    try {
      const cities = await sequelize.query("SELECT * FROM cities", {
        type: sequelize.QueryTypes.SELECT,
      });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", ` Get all city successful:`, {
        executionTime,
        component,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      res.status(200).json({ success: true, data: cities });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1099;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching cities ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      res.status(500).json({ success: false, errorCode: 1099, message: 'Error fetching cities', error: error.message });
    }
  };
  
  // Get city details by cityId, including state and country information
  exports.getCityDetails = async (req, res) => {
    const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
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

        const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", ` fetche city successfull:`, {
      executionTime,
      component,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
        res.status(200).json({ success: true, data: cityDetails[0] });
      } else {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1100;
    
        // Log the warning
        logger.logWithMeta("warn", `City not found ${error.message}`, {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
    
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method    ,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
        res.status(404).json({ success: false, errorCode: 1100, message: 'City not found' });
      }
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1101;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching city details ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      res.status(500).json({ success: false, errorCode: 1101, message: 'Error fetching city details', error: error.message });
    }
  };