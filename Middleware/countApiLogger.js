



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
// const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
// const logger = require('../logger'); // Adjust the path as necessary
// const useragent = require('useragent');
// const requestIp = require('request-ip');
// const geoip = require('geoip-lite');
// const jwt = require('jsonwebtoken');

// const countApiLogger = async (req, res, next) => {
//   const start = Date.now();
//   const { method, originalUrl, query } = req;
//   const { Username } = req.body || query; // Extract from the request body or query params
  
//   // Get the real IP address of the client
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
//   if (clientIp === '::1') {
//     clientIp = '127.0.0.1'; // Handle local IPv6 loopback
//   }

//   const geo = geoip.lookup(clientIp);
//   const city = geo && geo.city ? geo.city : 'Unknown';

//   const userAgentString = req.headers['user-agent'] || 'Unknown';
//   const userAgent = useragent.parse(userAgentString); // Parse user-agent header

//   // Decode the JWT token to get the hospital ID
//   let hospitalId = 'Unknown';
//   const token = req.headers['authorization'];
//   if (token) {

//     try {
//       const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
//       hospitalId = decoded.hospitalId || 'Unknown';
//     } catch (err) {
//       logger.error('Error decoding token', { error: err.message });
//     }
    
//   }

//   const logDetails = {
//     Apiname: originalUrl,
//     location: city,
//     createdby:    req.hospitalId,
//     ApiMethod: method,
//     createdname: req.userId || 'Unknown',
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

















// const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
// const logger = require('../logger'); // Adjust the path as necessary
// const useragent = require('useragent');
// const requestIp = require('request-ip');
// const geoip = require('geoip-lite');
// const jwt = require('jsonwebtoken');

// const countApiLogger = async (req, res, next) => {
//   const start = Date.now();
//   const { method, originalUrl, query } = req;
//   const { Username } = req.body || query; // Extract from the request body or query params
  
//   // Get the real IP address of the client
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
//   if (clientIp === '::1') {
//     clientIp = '127.0.0.1'; // Handle local IPv6 loopback
//   }

//   const geo = geoip.lookup(clientIp);
//   const city = geo && geo.city ? geo.city : 'Unknown';

//   const userAgentString = req.headers['user-agent'] || 'Unknown';
//   const userAgent = useragent.parse(userAgentString); // Parse user-agent header

//   // Initialize variables
//   let hospitalId = 'Unknown';
//   let userId = 'Unknown';

//   // Decode the JWT token to get the hospital ID and userId
//   const token = req.headers['authorization'];
//   if (token) {
//     try {
//       const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
      
//       // Assign decoded values to req object to use later
//       hospitalId = decoded.hospitalId || 'Unknown';  // Get the hospitalId from the token
//       userId = decoded.userId || 'Unknown';          // Get the userId from the token
      
//       // Assign to request so it can be used elsewhere if needed
//       req.hospitalId = hospitalId;
//       req.userId = userId;
//     } catch (err) {
//       logger.error('Error decoding token', { error: err.message });
//     }
//   }

//   // Log details
//   const logDetails = {
//     Apiname: originalUrl,
//     location: city,
//     createdby: hospitalId,          // Use decoded hospitalId
//     ApiMethod: method,
//     createdname: userId,            // Use decoded userId
//     userAgent: userAgentString,
//     ip: clientIp,
//     browser: userAgent.toAgent(),
//     os: userAgent.os.toString(),
//     platform: userAgent.device.toString()
//   };

//   console.log('Logging API request details:', logDetails); // Console log the details

//   // Store the log details in the database
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









// const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
// const logger = require('../logger'); // Adjust the path as necessary
// const useragent = require('useragent');
// const requestIp = require('request-ip');
// const geoip = require('geoip-lite');
// const jwt = require('jsonwebtoken');

// const countApiLogger = async (req, res, next) => {
//   const start = Date.now();
//   const { method, originalUrl, query } = req;
//   const { Username } = req.body || query; // Extract from the request body or query params

//   // Get the real IP address of the client
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
//   if (clientIp === '::1') {
//     clientIp = '127.0.0.1'; // Handle local IPv6 loopback
//   }

//   const geo = geoip.lookup(clientIp);
//   const city = geo && geo.city ? geo.city : 'Unknown';

//   const userAgentString = req.headers['user-agent'] || 'Unknown';
//   const userAgent = useragent.parse(userAgentString); // Parse user-agent header

//   // Initialize variables
//   let hospitalId = 'Unknown';
//   let userId = 'Unknown';
//   let accessTokenInfo = 'Unknown'; // For AccessToken info

//   // Decode the Authorization token to get hospitalId and userId
//   const authToken = req.headers['authorization'];
//   if (authToken) {
//     try {
//       const decoded = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
//       hospitalId = decoded.hospitalId || 'Unknown';  // Get the hospitalId from the token
//       userId = decoded.userId || 'Unknown';          // Get the userId from the token
      
//       // Assign to request so it can be used elsewhere if needed
//       req.hospitalId = hospitalId;
//       req.userId = userId;
 

//       // Debugging: Log decoded token information
//       console.log('Decoded Authorization token:', decoded);
//       console.log('Decoded userId :', userId);
//     } catch (err) {
//       logger.error('Error decoding Authorization token', { error: err.message });
//     }
//   }

//   // Decode the AccessToken if present
//   const accessToken = req.headers['accesstoken'];
//   if (accessToken) {
//     try {
//       // Replace this with the actual secret or logic for AccessToken if different
//       const decodedAccessToken = jwt.verify(accessToken.split(' ')[1], process.env.JWT_SECRET); 
//       accessTokenInfo = decodedAccessToken.info || 'Unknown'; // Extract relevant info from AccessToken

//       // Debugging: Log decoded AccessToken information
//       console.log('Decoded AccessToken:', decodedAccessToken);
//     } catch (err) {
//       logger.error('Error decoding AccessToken', { error: err.message });
//     }
//   }

//   // Log details
//   const logDetails = {
//     Apiname: originalUrl,
//     location: city,
//     hospitalId: hospitalId,        // Store hospitalId in the hospitalId column
//     ApiMethod: method,
//     createdby: userId,             // Store userId in the createdby column
//     accessTokenInfo: accessTokenInfo, // Include AccessToken information
//     userAgent: userAgentString,
//     ip: clientIp,
//     browser: userAgent.toAgent(),
//     os: userAgent.os.toString(),
//     platform: userAgent.device.toString()
//   };

//   console.log('logDetails before saving:', logDetails); // Add this for debugging

//   // Store the log details in the database
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












// const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
// const logger = require('../logger'); // Adjust the path as necessary
// const useragent = require('useragent');
// const requestIp = require('request-ip');
// const geoip = require('geoip-lite');
// const jwt = require('jsonwebtoken');

// const countApiLogger = async (req, res, next) => {
//   const start = Date.now();
//   const { method, originalUrl, query } = req;
//   const { Username } = req.body || query; // Extract from the request body or query params

//   // Get the real IP address of the client
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
//   if (clientIp === '::1') {
//     clientIp = '127.0.0.1'; // Handle local IPv6 loopback
//   }

//   const geo = geoip.lookup(clientIp);
//   const city = geo && geo.city ? geo.city : 'Unknown';

//   const userAgentString = req.headers['user-agent'] || 'Unknown';
//   const userAgent = useragent.parse(userAgentString); // Parse user-agent header

//   // Initialize variables
//   let hospitalId = 'Unknown';
//   let userId = 'Unknown';
//   let accessTokenInfo = 'Unknown'; // For AccessToken info

//   // Decode the Authorization token to get hospitalId and userId
//   const authToken = req.headers['authorization'];
//   if (authToken) {
//     try {
//       const decoded = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
//       hospitalId = decoded.hospitalId || 'Unknown';  // Get the hospitalId from the token
//    // Get the userId from the token
      
//       // Assign to request so it can be used elsewhere if needed
//       req.hospitalId = hospitalId;
//       req.userId = userId;

//       // Debugging: Log decoded token information
//       console.log('Decoded Authorization token:', decoded);
//     } catch (err) {
//       logger.error('Error decoding Authorization token', { error: err.message });
//       return res.status(401).json({ message: 'Invalid Authorization token' });
//     }
//   } else {
//     return res.status(401).json({ message: 'Authorization token missing' });
//   }

//   // Check the AccessToken if present and required
//   const accessToken = req.headers['accesstoken'];
//   if (accessToken) {
//     try {
//       const decodedAccessToken = jwt.verify(accessToken.split(' ')[1], process.env.JWT_SECRET); 
//       accessTokenInfo = decodedAccessToken.info || 'Unknown'; // Extract relevant info from AccessToken
//       userId = decodedAccessToken.userId || 'Unknown';          
//       // Debugging: Log decoded AccessToken information
//       console.log('Decoded AccessToken:', decodedAccessToken);
//       console.log('Decoded userId+++++++++*******:', userId);
//     } catch (err) {
//       logger.error('Error decoding AccessToken', { error: err.message });
//       return res.status(403).json({ message: 'Invalid AccessToken' }); // Block access if AccessToken is invalid
//     }
//   } else {
//     return res.status(403).json({ message: 'AccessToken missing' }); // Block access if AccessToken is missing
//   }

//   // Log details
//   const logDetails = {
//     Apiname: originalUrl,
//     location: city,
//     hospitalId: hospitalId,        // Store hospitalId in the hospitalId column
//     ApiMethod: method,
//     createdby: userId,             // Store userId in the createdby column
//     accessTokenInfo: accessTokenInfo, // Include AccessToken information
//     userAgent: userAgentString,
//     ip: clientIp,
//     browser: userAgent.toAgent(),
//     os: userAgent.os.toString(),
//     platform: userAgent.device.toString()
//   };

//   console.log('logDetails before saving:', logDetails); // Debugging log

//   // Store the log details in the database
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

const CountAPI = require('../models/ApisCounts'); // Adjust the path as necessary
const logger = require('../logger'); // Adjust the path as necessary
const useragent = require('useragent');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');
const axios = require('axios'); 
const UAParser = require('ua-parser-js');

const countApiLogger = async (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, query } = req;
  const { Username } = req.body || query; // Extract from the request body or query params




  // Function to get public IP

  // Get the real IP address of the client
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.error('Error fetching public IP', { error: error.message });
      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  console.log('Client IP:', clientIp);

  // Fetch location using the public IP
  let locationData = { city: 'Unknown' }; // Default location if lookup fails
  try {
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    locationData = locationResponse.data;
    console.log('Location Data:', locationData);
  } catch (error) {
    logger.error('Error fetching location data', { error: error.message });
  }


  const userAgentString = req.headers['user-agent'] || 'Unknown';
console.log('Raw User-Agent String:', userAgentString);

// Check for common tools like Postman
let browserInfo = 'Unknown';
let osInfo = 'Unknown';
let platformInfo = 'Unknown';

if (userAgentString.includes('Postman')) {
    browserInfo = 'Postman';
    osInfo = 'Postman';
    platformInfo = 'Postman';
} else {
    const parser = new UAParser();
    const userAgent = parser.setUA(userAgentString).getResult();

    browserInfo = userAgent.browser.name && userAgent.browser.version
        ? `${userAgent.browser.name} ${userAgent.browser.version}`
        : 'Unknown Browser';
    osInfo = userAgent.os.name && userAgent.os.version
        ? `${userAgent.os.name} ${userAgent.os.version}`
        : 'Unknown OS';
    platformInfo = userAgent.device.model || 'Unknown';
}

console.log('Parsed Browser Info:', browserInfo);
console.log('Parsed OS Info:', osInfo);
console.log('Parsed Platform Info:', platformInfo);



  // const userAgentString = req.headers['user-agent'] || 'Unknown';
  // const userAgent = useragent.parse(userAgentString); // Parse user-agent header
  // const browserInfo = userAgent.toAgent(); // Browser name and version
  // const osInfo = userAgent.os.toString(); // OS name and version
  // const platformInfo = userAgent.device.toString(); // Device platform info (if available)

  console.log('Browser Info:', browserInfo);
  console.log('OS Info:', osInfo);
  console.log('Platform Info:', platformInfo);

  // Initialize variables
  let hospitalId = 'Unknown';
  let userId = 'Unknown';
  let accessTokenInfo = 'Unknown'; // For AccessToken info

  // Decode the Authorization token if present
  const authToken = req.headers['authorization'];
  if (authToken) {
    try {
      const decoded = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary
      hospitalId = decoded.hospitalId || 'Unknown';  // Get the hospitalId from the token

      // Assign hospitalId to request object if needed elsewhere
      req.hospitalId = hospitalId;
      
      // Debugging: Log decoded token information
      console.log('Decoded Authorization token:', decoded);
    } catch (err) {
      logger.error('Invalid Authorization token provided', { error: err.message });
      // Continue without blocking the request
    }
  }

  // Decode the AccessToken if present
  const accessToken = req.headers['accesstoken'];
  if (accessToken) {
    try {
      const decodedAccessToken = jwt.verify(accessToken.split(' ')[1], process.env.JWT_SECRET);
      accessTokenInfo = decodedAccessToken.info || 'Unknown'; // Extract relevant info from AccessToken
      userId = decodedAccessToken.userId || 'Unknown'; // Extract userId from AccessToken
      
      // Debugging: Log decoded AccessToken information
      console.log('Decoded AccessToken:', decodedAccessToken);
    } catch (err) {
      logger.error('Invalid AccessToken provided', { error: err.message });
      // Continue without blocking the request
    }
  }

  // Even if the tokens are invalid, we still log the request and allow it to proceed.
  logger.info('Tokens are optional, proceeding even if they are invalid or missing.');

  // Log details
  const logDetails = {
    Apiname: originalUrl,
    location: locationData.city,
    hospitalId: hospitalId,        // Store hospitalId in the hospitalId column (if available)
    ApiMethod: method,
    createdby: userId,             // Store userId in the createdby column (if available from AccessToken)
    accessTokenInfo: accessTokenInfo, // Include AccessToken information (if available)
    userAgent: userAgentString,
    ip: clientIp,
    browser: browserInfo,          // Browser information
    os: osInfo,                    // OS information
    platform: platformInfo  
  };

  console.log('logDetails before saving:', logDetails); // Debugging log

  // Store the log details in the database
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
