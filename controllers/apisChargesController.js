


// controllers/chargesController.js
const CountAPI = require('../models/ApisCounts');
const Charges = require('../models/apichargaes');
const { Op } = require('sequelize');
const logger = require('../logger');


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




exports.createCharge = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  const { Apiname, hospitalId, chargeRate } = req.body;

  try {
    // Check if all required fields are present
    if (!Apiname || !hospitalId || !chargeRate) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1103;
  
      // Log the warning
      logger.logWithMeta("warn", `Charge creation failed: Missing required fields ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn('Charge creation failed: Missing required fields', { errorCode: 1096 });
      return res.status(400).json({
        errorCode: 1103,
        message: 'All fields (Apiname, hospitalId, chargeRate) are required.'
      });
    }

    // Create a new charge entry
    const newCharge = await Charges.create({
      Apiname,
      hospitalId,
      chargeRate
    });

    // Log success message
    // logger.info('Charge created successfully', { Apiname, hospitalId, chargeRate });
    const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", ` Charge created successfully:`, {
        executionTime,
        chargeRate,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });

    // Return the newly created charge
    return res.status(200).json({
      message: 'Charge created successfully',
      charge: newCharge
    });

  } catch (error) {
    // Log the error message
    // logger.error('Error creating charge', { errorCode: 1097, error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1104;

    // Log the warning
    logger.logWithMeta("warn", `Error creating charge ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // Return internal server error with proper error code
    return res.status(500).json({
      errorCode: 1104,
      message: 'Internal server error. Unable to create charge.'
    });
  }
};
exports.calculateCharges = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req); // Get client IP

  // Destructure the query parameters
  const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.query;

  try {
    // Ensure required parameters are provided
    if (!Apiname || !hospitalId) {
      return res.status(400).json({
        errorCode: 1101,
        message: 'Apiname and hospitalId are required parameters'
      });
    }

    let whereConditions = {
      Apiname,
      hospitalId
    };

    // Handle time conditions based on hoursAgo or date range
    if (hoursAgo) {
      const currentTime = new Date();
      const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
      whereConditions.createdAt = {
        [Op.between]: [pastTime, currentTime]
      };
    } else if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999); // Include the entire day
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    }

    // Query the count of API calls
    const apiCallCount = await CountAPI.count({
      where: whereConditions
    });

    // Query the charge rate for the given API and hospital
    const chargeData = await Charges.findOne({
      where: {
        Apiname,
        hospitalId
      }
    });

    if (!chargeData) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;

      // Log the warning
      logger.logWithMeta('warn', `Charges not found for API: ${Apiname}`, {
        errorCode: 1105,
        executionTime,
        hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'] // HTTP method
      });

      return res.status(404).json({
        errorCode: 1105,
        message: 'Charges not found for this API'
      });
    }

    // Calculate total charges
    const totalCharges = apiCallCount * chargeData.chargeRate;

    // Log successful charge calculation
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta('info', `Charges calculated for API: ${Apiname}`, {
      executionTime,
      apiCallCount,
      totalCharges,
      hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent']
    });

    // Send response with calculated charges
    return res.status(200).json({
      Apiname,
      hospitalId,
      apiCallCount,
      chargeRate: chargeData.chargeRate,
      totalCharges
    });

  } catch (error) {
    // Handle unexpected errors
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta('error', `Error calculating charges for API: ${Apiname}`, {
      errorCode: 1106,
      errorMessage: error.message,
      errorStack: error.stack, // Capture full error stack
      executionTime,
      hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent']
    });

    return res.status(500).json({
      errorCode: 1106,
      message: 'Internal server error'
    });
  }
};
// exports.calculateChargeswithDetails = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999);
//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     const apiCalls = await CountAPI.findAll({
//       where: whereConditions,
//       attributes: ['id', 'createdby', 'createdAt', 'userAgent']
//     });

//     const apiCallCount = apiCalls.length;

//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       logger.error(`Charges not found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1098 });
//       return res.status(404).json({
//         errorCode: 1098,
//         message: 'Charges not found for this API'
//       });
//     }

//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Success logging
//     logger.info(`Charges and API details retrieved for API: ${Apiname}, Hospital: ${hospitalId}, Calls: ${apiCallCount}, Total Charges: ${totalCharges}`);

//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges,
//       apiDetails: apiCalls
//     });

//   } catch (error) {
//     logger.error(`Error retrieving API details for API: ${Apiname}, Hospital: ${hospitalId}. Error: ${error.message}`, { errorCode: 1099 });
//     return res.status(500).json({
//       errorCode: 1099,
//       message: 'Internal server error'
//     });
//   }
// };


exports.calculateChargeswithDetails = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
  const start = Date.now();
  const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.query;

  try {
    // Validate required parameters
    if (!Apiname || !hospitalId) {
      // logger.error('Missing required fields: Apiname or hospitalId', { errorCode: 1100 });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1107;
  
      // Log the warning
      logger.logWithMeta("warn", `Missing required fields: Apiname or hospitalId${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      return res.status(400).json({
        errorCode: 1107,
        message: 'Missing required fields: Apiname or hospitalId'
      });
    }

    let whereConditions = {
      Apiname,
      hospitalId
    };

    // Filter based on hoursAgo or date range
    if (hoursAgo) {
      const currentTime = new Date();
      const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
      whereConditions.createdAt = {
        [Op.between]: [pastTime, currentTime]
      };
    } else if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    }

    // Retrieve API call details
    const apiCalls = await CountAPI.findAll({
      where: whereConditions,
      attributes: ['id', 'createdby', 'createdAt', 'userAgent']
    });

    const apiCallCount = apiCalls.length;

    if (apiCallCount === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1108;
  
      // Log the warning
      logger.logWithMeta("warn", `No API calls found for API:${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn(`No API calls found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1101 });
      return res.status(404).json({
        errorCode: 1108,
        message: 'No API calls found for the given parameters'
      });
    }

    // Retrieve charge data for the API
    const chargeData = await Charges.findOne({
      where: { Apiname, hospitalId }
    });

    if (!chargeData) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1109;
  
      // Log the warning
      logger.logWithMeta("warn", `Charges not found for API: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Charges not found for API: ${Apiname}, Hospital: ${hospitalId}`, { errorCode: 1102 });
      return res.status(404).json({
        errorCode: 1109,
        message: 'Charges not found for this API'
      });
    }

    // Calculate total charges
    const totalCharges = apiCallCount * chargeData.chargeRate;

    // Success logging
    // logger.info(`Charges and API details retrieved successfully for API: ${Apiname}, Hospital: ${hospitalId}. Calls: ${apiCallCount}, Total Charges: ${totalCharges}`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", ` Charges and API call details retrieved successfully:`, {
      executionTime,
      apiCallCount,
      totalCharges,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // Send success response with detailed information
    return res.status(200).json({
      message: 'Charges and API call details retrieved successfully',
      Apiname,
      hospitalId,
      apiCallCount,
      chargeRate: chargeData.chargeRate,
      method: req.method,
      totalCharges,
      apiDetails: apiCalls.map(call => ({
        id: call.id,
        createdBy: call.createdby,
        createdAt: call.createdAt,
        userAgent: call.userAgent
      }))
    });

  } catch (error) {
    const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1110;
  
      // Log the warning
      logger.logWithMeta("warn", `Error retrieving API details for API ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    // logger.error(`Error retrieving API details for API: ${Apiname}, Hospital: ${hospitalId}. Error: ${error.message}`, { errorCode: 1103 });
    return res.status(500).json({
      errorCode: 1110,
      message: 'Internal server error',
      details: error.message
    });
  }
};
exports.calculateTotalChargesWithDetails = async (req, res) => {
  const clientIp = await getClientIp(req); // Get the client IP
  const start = Date.now();
  const { hospitalId, startDate, endDate } = req.params;

  try {
    // Validate required parameters
    if (!hospitalId || !startDate || !endDate) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1111;

      // Log the warning
      logger.logWithMeta("warn", `Missing required fields: hospitalId, startDate, or endDate`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(400).json({
        errorCode,
        message: 'Missing required fields: hospitalId, startDate, or endDate',
      });
    }

    // Adjust the endDate to include the full day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // Retrieve all API call records for the given hospitalId in the specified date range
    const apiCalls = await CountAPI.findAll({
      where: {
        hospitalId,
        createdAt: {
          [Op.between]: [new Date(startDate), adjustedEndDate],
        },
      },
      attributes: ['Apiname', 'createdby', 'createdAt', 'userAgent'],
    });

    const apiCallCount = apiCalls.length;

    if (apiCallCount === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1112;

      // Log the warning
      logger.logWithMeta("warn", `No API calls found for hospitalId: ${hospitalId}`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(404).json({
        errorCode,
        message: 'No API calls found for the given parameters',
      });
    }

    // Retrieve all unique charges for the APIs called by this hospital
    const uniqueApiNames = [...new Set(apiCalls.map(call => call.Apiname))];
    const charges = await Charges.findAll({
      where: {
        Apiname: { [Op.in]: uniqueApiNames },
        hospitalId,
      },
      attributes: ['Apiname', 'chargeRate'],
    });

    if (charges.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1113;

      // Log the warning
      logger.logWithMeta("warn", `Charges not found for the APIs called by hospitalId: ${hospitalId}`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(404).json({
        errorCode,
        message: 'Charges not found for the APIs called by this hospital',
      });
    }

    // Calculate total charges by multiplying the charge rate by the API call count
    let totalCharges = 0;
    charges.forEach(charge => {
      const apiCallCountForCharge = apiCalls.filter(call => call.Apiname === charge.Apiname).length;
      totalCharges += apiCallCountForCharge * charge.chargeRate;
    });

    // Success logging
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta("info", `Total charges calculated successfully for hospitalId: ${hospitalId}`, {
      executionTime,
      apiCallCount,
      totalCharges,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    // Send success response with detailed information
    return res.status(200).json({
      message: 'Total charges calculated successfully',
      hospitalId,
      apiCallCount,
      totalCharges,
      startDate,
      endDate,
      apiDetails: apiCalls.map(call => ({
        Apiname: call.Apiname,
        createdBy: call.createdby,
        createdAt: call.createdAt,
        userAgent: call.userAgent,
      })),
    });

  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1114;

    // Log the error
    logger.logWithMeta("error", `Error calculating total charges for hospitalId: ${hospitalId}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    return res.status(500).json({
      errorCode,
      message: 'Internal server error',
      details: error.message,
    });
  }
};
// exports.calculateTotalChargesWithDetailsbyHospitalid = async (req, res) => {
//   const clientIp = await getClientIp(req); // Get the client IP
//   const start = Date.now();
//   const { hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     // Validate required parameters
//     if (!hospitalId) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1107;

//       // Log the warning
//       logger.logWithMeta("warn", `Missing required field: hospitalId`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'], // HTTP method
//       });
//       return res.status(400).json({
//         errorCode: 1107,
//         message: 'Missing required field: hospitalId'
//       });
//     }

//     // Initialize where conditions
//     let whereConditions = { hospitalId };

//     // Filter based on hoursAgo or date range
//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999);
//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Retrieve API call details for the given hospitalId
//     const apiCalls = await CountAPI.findAll({
//       where: whereConditions,
//       attributes: ['id', 'createdby', 'createdAt', 'userAgent', 'apiName'] // Include apiName to determine charge rate
//     });

//     const apiCallCount = apiCalls.length;

//     if (apiCallCount === 0) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1108;

//       // Log the warning
//       logger.logWithMeta("warn", `No API calls found for hospitalId: ${hospitalId}`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'], // HTTP method
//       });
//       return res.status(404).json({
//         errorCode: 1108,
//         message: 'No API calls found for the given hospitalId'
//       });
//     }
//     const uniqueApiNames = [...new Set(apiCalls.map(call => call.Apiname))];
//     const charges = await Charges.findAll({
//       where: {
//         apiName: { [Op.in]: uniqueApiNames },
//         hospitalId,
//       },
//       attributes: ['apiName', 'chargeRate']
//     });
    
//     // Create a dictionary of charge rates
//     const chargeRateMap = {};
//     charges.forEach(charge => {
//       chargeRateMap[charge.apiName] = charge.chargeRate;
//     });
//     console.log("chargeRateMap*******", charges)
    
//     // Calculate total charges using the pre-fetched rates
//     let totalCharges = 0;
//     apiCalls.forEach(call => {
//       if (chargeRateMap[call.apiName]) {
//         totalCharges += chargeRateMap[call.apiName]; // Add charge rate to total charges
//       } else {
//         logger.logWithMeta("warn", `Charge rate not found for apiName: ${call.apiName}`, {
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'], // HTTP method
//         });
//       }
//     });
    

//     for (const call of apiCalls) {
//       if (!call.apiName) {
//         // Log a warning if apiName is missing and skip this API call
//         logger.logWithMeta("warn", `Missing apiName for API call with ID: ${call.id}`, {
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'], // HTTP method
//         });
//         continue; // Skip this iteration
//       }

      
//       // For each API call, fetch the charge rate based on the API name
//       const chargeData = await Charges.findOne({
//         where: {
//           hospitalId,
//           apiName: call.apiName // Fetch charge rate based on apiName
//         },
//         attributes: ['chargeRate']
//       });

//       if (chargeData) {
//         totalCharges += chargeData.chargeRate; // Add charge rate to total charges
//       } else {
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 1109;

//         // Log the warning if charge rate for a specific API is not found
//         logger.logWithMeta("warn", `Charge rate not found for apiName: ${call.apiName}`, {
//           errorCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'], // HTTP method
//         });
//       }
//     }

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     // Log the success
//     logger.logWithMeta("info", `Total charges calculated successfully for hospitalId: ${hospitalId}`, {
//       executionTime,
//       apiCallCount,
//       totalCharges,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     // Send success response with detailed information
//     return res.status(200).json({
//       message: 'Total charges calculated successfully',
//       hospitalId,
//       apiCallCount,
//       totalCharges,
//       apiDetails: apiCalls.map(call => ({
//         id: call.id,
//         createdBy: call.createdby,
//         createdAt: call.createdAt,
//         userAgent: call.userAgent,
//         apiName: call.apiName // Include API name in the response
//       }))
//     });

//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1110;

//     // Log the error
//     logger.logWithMeta("error", `Error calculating total charges: ${error.message}`, {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     return res.status(500).json({
//       errorCode: 1110,
//       message: 'Internal server error',
//       details: error.message
//     });
//   }
// };


exports.calculateTotalChargesWithDetailsbyHospitalid = async (req, res) => {
  const clientIp = await getClientIp(req); // Get the client IP
  const start = Date.now();
  const { hospitalId, startDate, endDate, hoursAgo } = req.params;

  try {
    // Validate required parameters
    if (!hospitalId) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1107;

      // Log the warning
      logger.logWithMeta("warn", `Missing required field: hospitalId`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'], // HTTP method
      });
      return res.status(400).json({
        errorCode: 1107,
        message: 'Missing required field: hospitalId'
      });
    }

    // Initialize where conditions
    let whereConditions = { hospitalId };

    // Filter based on hoursAgo or date range
    if (hoursAgo) {
      const currentTime = new Date();
      const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
      whereConditions.createdAt = {
        [Op.between]: [pastTime, currentTime]
      };
    } else if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    }

    // Retrieve API call details for the given hospitalId
    const apiCalls = await CountAPI.findAll({
      where: whereConditions,
      attributes: ['id', 'createdby', 'createdAt', 'userAgent', 'apiName'] // Include apiName to determine charge rate
    });

    console.log("apiCalls",apiCalls)
    const apiCallCount = apiCalls?.length;

    if (apiCallCount === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1108;

      // Log the warning
      logger.logWithMeta("warn", `No API calls found for hospitalId: ${hospitalId}`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'], // HTTP method
      });
      return res.status(404).json({
        errorCode: 1108,
        message: 'No API calls found for the given hospitalId'
      });
    }

    // Fetch unique apiNames from the API calls
    const uniqueApiNames = [...new Set(apiCalls.map(call => call?.dataValues?.apiName))];
    // const allApiNames = [...new Set(apiCalls.map(call => call?.dataValues?.apiName))];
    

    // console.log("apiCalls", apiCalls)
    // console.log("allApiNames", uniqueApiNames)

    // Retrieve charge rates for all API calls in one go
    const chargesResult = await Charges.findAll({
      where: {
        apiName: { [Op.in]: uniqueApiNames },
        hospitalId,
      },
      attributes: ['apiName', 'chargeRate']
    });
    
    // Extract the `dataValues` from each result
    const charges = chargesResult.map(charge => charge.dataValues);

    console.log("charges",charges)
    
    // Create a dictionary of charge rates
    const chargeRateMap = {};
    charges.forEach(charge => {
      chargeRateMap[charge.apiName] = parseFloat(charge.chargeRate); // Convert chargeRate to a float for calculation
    });
    // console.log("chargeRateMap+++++", chargeRateMap)

    function calculateTotalCharge(chargeObject) {
      let total = 0;
      
      // Iterate over the object values and sum them
      for (const key in chargeObject) {
        if (chargeObject.hasOwnProperty(key)) {
          total += chargeObject[key];
        }
      }
      
      return total;
    }

    
    
    // Calculate total charges using the pre-fetched rates
    // let totalCharges = 0;
    let totalCharges = 0
    apiCalls.forEach(call => {
      const chargeRate = chargeRateMap[call?.dataValues?.apiName];
      // console.log("chargeRate++++++",chargeRate)
  
      if (chargeRate) {
        totalCharges += chargeRate;
      } else {
        logger.logWithMeta("warn", `Charge rate not found for apiName: ${call.apiName}`, {
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'], // HTTP method
        });
      }
    });

    console.log("Charge Rate Map:++++++++++", chargeRateMap);

    // console.log(totalCharges)

    const end = Date.now();
    const executionTime = `${end - start}ms`;


    // Log the success
    logger.logWithMeta("info", `Total charges calculated successfully for hospitalId: ${hospitalId}`, {
      executionTime,
      apiCallCount,
      totalCharges,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'], // HTTP method
    });
    
    console.log("apiCalls structure:", apiCalls);

    // Send success response with detailed information
    
    return res.status(200).json({
      message: 'Total charges calculated successfully',
      hospitalId,
      apiCallCount,
      totalCharges,
      apiDetails: apiCalls.map(call => ({
        
        id: call.id,
        createdBy: call.createdby,
        createdAt: call.createdAt,
        userAgent: call.userAgent,
        apiName: apiCalls.apiName,
        // chargeRate: chargeRateMap[call.apiName]
        
      }))
    });

  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1110;

    // Log the error
    logger.logWithMeta("error", `Error calculating total charges: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'], // HTTP method
    });

    return res.status(500).json({
      errorCode: 1110,
      message: 'Internal server error',
      details: error.message
    });
  }
};










// exports.calculateCharges = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       // Adjust endDate to include the entire day
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999); // Set to end of the day

//       // Debugging output
//       console.log('Query Range:', {
//         startDate: new Date(startDate).toISOString(),
//         endDate: adjustedEndDate.toISOString()
//       });

//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Debugging output
//     console.log('Where Conditions:', whereConditions);

//     // Get the count of API calls from CountAPI table
//     const apiCallCount = await CountAPI.count({
//       where: whereConditions
//     });

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
// exports.calculateChargeswithDetails = async (req, res) => {
//   const { Apiname, hospitalId, startDate, endDate, hoursAgo } = req.body;

//   try {
//     let whereConditions = {
//       Apiname,
//       hospitalId
//     };

//     if (hoursAgo) {
//       const currentTime = new Date();
//       const pastTime = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);
//       whereConditions.createdAt = {
//         [Op.between]: [pastTime, currentTime]
//       };
//     } else if (startDate && endDate) {
//       const adjustedEndDate = new Date(endDate);
//       adjustedEndDate.setHours(23, 59, 59, 999); // Include the whole day

//       whereConditions.createdAt = {
//         [Op.between]: [new Date(startDate), adjustedEndDate]
//       };
//     }

//     // Get the count of API calls and the list of details from CountAPI table
//     const apiCalls = await CountAPI.findAll({
//       where: whereConditions,
//       attributes: ['id', 'createdby', 'createdAt', 'userAgent'] // Include the necessary fields
//     });

//     const apiCallCount = apiCalls.length; // Calculate the count based on the retrieved data

//     // Get the charge rate for the API from Charges table
//     const chargeData = await Charges.findOne({
//       where: {
//         Apiname,
//         hospitalId
//       }
//     });

//     if (!chargeData) {
//       return res.status(404).json({ message: 'Charges not found for this API' });
//     }

//     // Calculate the total charges
//     const totalCharges = apiCallCount * chargeData.chargeRate;

//     // Send the response with total charges and the list of API call details
//     return res.status(200).json({
//       Apiname,
//       hospitalId,
//       apiCallCount,
//       chargeRate: chargeData.chargeRate,
//       totalCharges,
//       apiDetails: apiCalls // Send the list of API call details
//     });

//   } catch (error) {
//     console.error('Error calculating charges:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };





// exports.calculateTotalChargesWithDetails = async (req, res) => {
//   const clientIp = await getClientIp(req); // Get the HospitalIDR from the decoded token
//   const start = Date.now();
  
//   // Change to get parameters from req.params
//   const { hospitalId, startDate, endDate } = req.params;

//   try {
//     // Validate required parameters
//     if (!hospitalId || !startDate || !endDate) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1111;

//       // Log the warning
//       logger.logWithMeta("warn", `Missing required fields: hospitalId, startDate, or endDate`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers['user-agent'],
//       });

//       return res.status(400).json({
//         errorCode: 1111,
//         message: 'Missing required fields: hospitalId, startDate, or endDate',
//       });
//     }

//     // Adjust the endDate to include the full day
//     const adjustedEndDate = new Date(endDate);
//     adjustedEndDate.setHours(23, 59, 59, 999);

//     // Retrieve all API call records for the given hospitalId in the specified date range
//     const apiCalls = await CountAPI.findAll({
//       where: {
//         hospitalId,
//         createdAt: {
//           [Op.between]: [new Date(startDate), adjustedEndDate],
//         },
//       },
//       attributes: ['Apiname', 'createdby', 'createdAt', 'userAgent'],
//     });

//     const apiCallCount = apiCalls.length;

//     if (apiCallCount === 0) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1112;

//       // Log the warning
//       logger.logWithMeta("warn", `No API calls found for the hospitalId:${hospitalId}`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers['user-agent'],
//       });

//       return res.status(404).json({
//         errorCode: 1112,
//         message: 'No API calls found for the given parameters',
//       });
//     }

//     // Retrieve all unique charges for the APIs called by this hospital
//     const uniqueApiNames = [...new Set(apiCalls.map(call => call.Apiname))];
//     const charges = await Charges.findAll({
//       where: {
//         Apiname: { [Op.in]: uniqueApiNames },
//         hospitalId,
//       },
//       attributes: ['Apiname', 'chargeRate'],
//     });

//     if (charges.length === 0) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1113;

//       // Log the warning
//       logger.logWithMeta("warn", `Charges not found for the APIs called by hospitalId:${hospitalId}`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers['user-agent'],
//       });

//       return res.status(404).json({
//         errorCode: 1113,
//         message: 'Charges not found for the APIs called by this hospital',
//       });
//     }

//     // Calculate total charges by multiplying the charge rate by the API call count
//     let totalCharges = 0;
//     charges.forEach(charge => {
//       const apiCallCountForCharge = apiCalls.filter(call => call.Apiname === charge.Apiname).length;
//       totalCharges += apiCallCountForCharge * charge.chargeRate;
//     });

//     // Success logging
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     logger.logWithMeta("info", `Total charges calculated successfully for hospitalId:${hospitalId}`, {
//       executionTime,
//       apiCallCount,
//       totalCharges,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });

//     // Send success response with detailed information
//     return res.status(200).json({
//       message: 'Total charges calculated successfully',
//       hospitalId,
//       apiCallCount,
//       totalCharges,
//       startDate,
//       endDate,
//       apiDetails: apiCalls.map(call => ({
//         Apiname: call.Apiname,
//         createdBy: call.createdby,
//         createdAt: call.createdAt,
//         userAgent: call.userAgent,
//       })),
//     });

//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1114;

//     // Log the error
//     logger.logWithMeta("error", `Error calculating total charges for hospitalId:${hospitalId}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });

//     return res.status(500).json({
//       errorCode: 1114,
//       message: 'Internal server error',
//       details: error.message,
//     });
//   }
// };
