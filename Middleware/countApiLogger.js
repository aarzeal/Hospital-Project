



// middlewares/countApiLogger.js
// const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
// const logger = require('../logger'); // Adjust the path as necessary
// const useragent = require('useragent');
// const requestIp = require('request-ip');

// const countApiLogger = async (req, res, next) => {
//   const start = Date.now();
//   const { method, originalUrl, query } = req;
//   const { city, Username, hospitalId } = req.body || query; // Extract from the request body or query params
  
//   // Get the real IP address of the client
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
//   if (clientIp === '::1') {
//     clientIp = '127.0.0.1'; // Handle local IPv6 loopback
//   }

//   const userAgentString = req.headers['user-agent'] || 'Unknown';
//   const userAgent = useragent.parse(userAgentString); // Parse user-agent header

//   const logDetails = {
//     Apiname: originalUrl,
//     location: city || 'Unknown',
//     createdby: hospitalId || 'Unknown',
//     ApiMethod: method,
//     createdname: Username || 'Unknown',
//     userAgent: userAgentString,
//     ip: clientIp,
//     browser: userAgent.toAgent(),
//     os: userAgent.os.toString(),
//     platform: userAgent.device.toString()
//   };

//   console.log('Logging API request details:', logDetails); // Console log the details

//   try {
//     await CountAPI.create(logDetails);
//     logger.info(`API call logged: ${originalUrl} with method ${method}`);
//   } catch (err) {
//     logger.error('Error creating CountAPI entry', { error: err.message });
//   }

//   const end = Date.now();
//   req.executionTime = `${end - start}ms`;
//   next();
// };

// module.exports = countApiLogger;

// middlewares/countApiLogger.js
const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
const logger = require('../logger'); // Adjust the path as necessary
const useragent = require('useragent');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');

const countApiLogger = async (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, query } = req;
  const { Username } = req.body || query; // Extract from the request body or query params
  
  // Get the real IP address of the client
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
  if (clientIp === '::1') {
    clientIp = '127.0.0.1'; // Handle local IPv6 loopback
  }

  const geo = geoip.lookup(clientIp);
  const city = geo && geo.city ? geo.city : 'Unknown';

  const userAgentString = req.headers['user-agent'] || 'Unknown';
  const userAgent = useragent.parse(userAgentString); // Parse user-agent header

  // Decode the JWT token to get the hospital ID
  let hospitalId = 'Unknown';
  const token = req.headers['authorization'];
  if (token) {

    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
      hospitalId = decoded.hospitalId || 'Unknown';
    } catch (err) {
      logger.error('Error decoding token', { error: err.message });
    }
    
  }

  const logDetails = {
    Apiname: originalUrl,
    location: city,
    createdby: hospitalId,
    ApiMethod: method,
    createdname: Username || 'Unknown',
    userAgent: userAgentString,
    ip: clientIp,
    browser: userAgent.toAgent(),
    os: userAgent.os.toString(),
    platform: userAgent.device.toString()
  };

  console.log('Logging API request details:', logDetails); // Console log the details

  try {
    await CountAPI.create(logDetails);
    logger.info(`API call logged: ${originalUrl} with method ${method}`);
  } catch (err) {
    logger.error('Error creating CountAPI entry', { error: err.message });
  }

  const end = Date.now();
  req.executionTime = `${end - start}ms`;
  next();
};

module.exports = countApiLogger;
