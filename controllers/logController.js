const mongoose = require('mongoose');

// Utility function to get model based on the collection name
const getModel = (collectionName) => {
  const logSchema = new mongoose.Schema({
    level: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    meta: mongoose.Schema.Types.Mixed,
    errorCode: Number,
    hospitalId: String,
  });

  // Check if the model already exists to avoid redefining it
  return mongoose.models[collectionName] || mongoose.model(collectionName, logSchema);
};


// Helper function to format date into the collection name format
const getCollectionNameByDate = (date) => {
  const today = new Date(date);
  return `logs_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
};

// Fetch all logs from a specific date
exports.getAllLogs = async (req, res) => {
  try {
    const { date } = req.query; // Date in the format YYYY-MM-DD
    const collectionName = getCollectionNameByDate(date || new Date()); // Default to today's logs
    const Log = getModel(collectionName);
    
    const logs = await Log.find({});
    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 931,
      },
      error: {
        message: `Error fetching logs: ${error.message}`,
      },
    });
  }
};

// Fetch log by ID
exports.getLogById = async (req, res) => {
  try {
    const { date } = req.query; // Specify the date to find the appropriate collection
    const { id } = req.params;
    const collectionName = getCollectionNameByDate(date || new Date());
    const Log = getModel(collectionName);

    const log = await Log.findById(id);
    if (!log) {
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 932,
        },
        error: {
          message: 'Log not found',
        },
      });
    }

    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 933,
      },
      error: {
        message: `Error fetching log: ${error.message}`,
      },
    });
  }
};
// Fetch log by ID
exports.getbyLogId = async (req, res) => {
  try {
    const { date } = req.query; // Specify the date to find the appropriate collection
    const { logId } = req.params;

    // Dynamically get the collection based on the date
    const collectionName = getCollectionNameByDate(date || new Date());
    const Log = getModel(collectionName);

    // Use findOne if logId is a field in the log document
    const log = await Log.findOne({ logId });
    
    // If no log found, return 404
    if (!log) {
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 932,
        },
        error: {
          message: 'Log not found',
        },
      });
    }

    // If log is found, return it
    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: log,
    });
  } catch (error) {
    // Handle any other errors
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 933,
      },
      error: {
        message: `Error fetching log: ${error.message}`,
      },
    });
  }
};

// Fetch logs within a specific time range
exports.getLogsByTime = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Format: YYYY-MM-DD
    const start = new Date(startDate);
    const end = new Date(endDate);
    const collectionName = getCollectionNameByDate(start);
    const Log = getModel(collectionName);

    const logs = await Log.find({
      timestamp: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 934,
      },
      error: {
        message: `Error fetching logs by time: ${error.message}`,
      },
    });
  }
};


// Function to get the appropriate model based on date
const getModelByDate = (date) => {
    const datePart = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
    const collectionName = `logs_${datePart}`;
  
    // Define schema for the logs collection
    const logSchema = new mongoose.Schema({
      level: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
      meta: mongoose.Schema.Types.Mixed,
      errorCode: Number,
      hospitalId: String,
    });
  
    // Return the model if it exists or create a new one
    return mongoose.models[collectionName] || mongoose.model(collectionName, logSchema, collectionName);
  };
  
  // Get logs by errorCode and hospitalId
  exports.getLogsByErrorCodeAndHospitalId = async (req, res) => {
    const { errorCode, hospitalId, date } = req.query;
  
    // Check if required parameters are provided
    if (!errorCode || !hospitalId) {
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 927, // Custom error code for missing parameters
        },
        error: {
          message: 'errorCode and hospitalId are required',
        },
      });
    }
  
    // Parse date or use today's date by default
    const logDate = date ? new Date(date) : new Date();
  
    try {
      // Get the correct model based on the date
      const Log = getModelByDate(logDate);
  
      // Find logs by errorCode and hospitalId
      const logs = await Log.find({
        errorCode: Number(errorCode),
        hospitalId,
      });
  
      res.status(200).json({
        meta: {
          statusCode: 200,
        },
        data: logs,
      });
    } catch (error) {
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 926, // Custom error code for server error
        },
        error: {
          message: `Error retrieving logs: ${error.message}`,
        },
      });
    }
  };







  async function getClientIp(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);
  
    // If IP is localhost or private, try fetching the public IP
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        clientIp = ipResponse.data.ip;
      } catch (error) {
  
        logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 971 });
  
        clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
      }
    }
  
    return clientIp;
  }


// Function to get the dynamic collection name based on date or other logic
function getDynamicCollectionName(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-based, so add 1
  const day = date.getDate(); // Get the day without padding

  return `logs_${year}_${month}_${day}`; // Example: logs_2024_10_9
}
const { logWithMeta,getIp  } = require('../Middleware/loggerUtility');
const requestIp = require('request-ip');
const { v4: uuidv4 } = require('uuid'); // For generating unique log IDs
const logger = require('../logger');



// exports.getDataByHospitalId = async (req, res) => {
//   try {
//     const { hospitalId } = req.params; // Get hospitalId from the URL parameters
//     const { date } = req.query; // Get date from the query parameters

//     // Ensure date is provided
//     if (!date) {
//       return res.status(400).json({errorCode: 1204, message: 'Date is required' });
//     }

//     // Parse the date from the query parameter
//     const queryDate = new Date(date);
//     if (isNaN(queryDate.getTime())) {
//       return res.status(400).json({errorCode: 1205, message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Get the dynamic collection name based on the provided date
//     const collectionName = getDynamicCollectionName(queryDate);
//     console.log('Using collection:', collectionName);

//     // Get the model for the dynamic collection
//     const LogModel = getModel(collectionName);

//     // Query the dynamic collection by hospitalId
//     const logs = await LogModel.find({ hospitalId: String(hospitalId) });

//     // Handle case where no logs are found
//     if (!logs || logs.length === 0) {
//       return res.status(404).json({ message: 'No logs found for this hospitalId on the provided date' });
//     }

//     // Return the data
//     return res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     return res.status(500).json({errorCode: 1206, message: 'Server Error', error: error.message });
//   }
// };
exports.getDataByHospitalId = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4(); // Generate a unique log ID for this request

  // Extract metadata from the request to pass to logWithMeta
  const { hospitalId } = req.params; // Get hospitalId from request parameters
  const { date } = req.query; // Get date from query parameters
  const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const apiName = req.originalUrl;
  const method = req.method;
  const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;

  try {
    // Ensure date is provided
    if (!date) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1204;
      const statusCode = 400;

      // Log the warning for missing date
      logWithMeta("warn", "Date is required", {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode,
          logId,
          executionTime
        },
        error: {
          message: 'Date is required'
        }
      });
    }

    // Parse the date from the query parameter
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1205;
      const statusCode = 400;

      // Log the warning for invalid date format
      logWithMeta("warn", "Invalid date format", {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode,
          logId,
          executionTime
        },
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD.'
        }
      });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    console.log('Using collection:', collectionName);

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Query the dynamic collection by hospitalId
    const logs = await LogModel.find({ hospitalId: String(hospitalId) });

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1207;
      const statusCode = 404;

      // Log the warning for no logs found
      logWithMeta("warn", `No logs found for hospital ID ${hospitalId}`, {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode,
          logId,
          executionTime
        },
        error: {
          message: 'No logs found for this hospitalId on the provided date'
        }
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the success response
    logWithMeta("info", `Retrieved logs for hospital ID ${hospitalId} successfully`, {
      logId,
      hospitalId,
      clientIp,
      userAgent,
      apiName,
      method,
      executionTime
    }, {
      logCount: logs.length
    });

    // Return the data
    return res.status(200).json({
      meta: {
        statusCode: 200,
        logId,
        executionTime
      },
      data: logs
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1206;
    const statusCode = 500;

    // Log the error
    logWithMeta("error", `Error fetching logs for hospital ID ${hospitalId}`, {
      logId,
      hospitalId,
      clientIp,
      userAgent,
      apiName,
      method,
      errorCode,
      executionTime,
      statusCode,
      error: error.message
    });

    return res.status(statusCode).json({
      meta: {
        statusCode,
        errorCode,
        logId,
        executionTime
      },
      error: {
        message: 'Server Error: ' + error.message
      }
    });
  }
};


// exports.getDataByErrorCode = async (req, res) => {
//   try {
//     const { hospitalId, errorCode, date } = req.params;

//     // Validate errorCode
//     if (!errorCode || isNaN(Number(errorCode))) {
//       return res.status(400).json({errorCode: 1207, message: 'Invalid or missing errorCode' });
//     }
    
//     // Validate date
//     if (!date) {
//       return res.status(400).json({errorCode: 1208, message: 'Date is required' });
//     }

//     // Parse the date
//     const queryDate = new Date(date);
//     if (isNaN(queryDate.getTime())) {
//       return res.status(400).json({ errorCode: 1209,message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Get the dynamic collection name based on the provided date
//     const collectionName = getDynamicCollectionName(queryDate);
//     console.log('Using collection:', collectionName);

//     // Get the model for the dynamic collection
//     const LogModel = getModel(collectionName);

//     // Build the query object for errorCode and hospitalId
//     const query = {
//       errorCode: Number(errorCode),
//       hospitalId: String(hospitalId), // Ensure hospitalId is part of the query
//     };

//     console.log('Query:', query);

//     // Query the dynamic collection
//     const logs = await LogModel.find(query);

//     // Handle the case where no logs are found
//     if (!logs || logs.length === 0) {
//       return res.status(404).json({ errorCode: 1210,message: 'No logs found for the given hospitalId and errorCode' });
//     }

//     // Return the found logs
//     return res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     return res.status(500).json({ errorCode: 1211,message: 'Server Error', error: error.message });
//   }
// };



exports.getDataByErrorCode = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4(); // Generate a unique log ID for this request

  // Extract metadata from the request to pass to logWithMeta
  const { hospitalId, errorCode, date } = req.params;
  const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const apiName = req.originalUrl;
  const method = req.method;
  const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;

  try {
    // Validate errorCode
    if (!errorCode || isNaN(Number(errorCode))) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1207;
      const statusCode = 400;

      // Log the invalid or missing errorCode
      logWithMeta("warn", "Invalid or missing errorCode", {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Invalid or missing errorCode'
        }
      });
    }

    // Validate date
    if (!date) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1208;
      const statusCode = 400;

      // Log the missing date
      logWithMeta("warn", "Date is required", {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Date is required'
        }
      });
    }

    // Parse the date
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1209;
      const statusCode = 400;

      // Log invalid date format
      logWithMeta("warn", "Invalid date format", {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD.'
        }
      });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    console.log('Using collection:', collectionName);

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Build the query object for errorCode and hospitalId
    const query = {
      errorCode: Number(errorCode),
      hospitalId: String(hospitalId), // Ensure hospitalId is part of the query
    };

    console.log('Query:', query);

    // Query the dynamic collection
    const logs = await LogModel.find(query);

    // Handle the case where no logs are found
    if (!logs || logs.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1210;
      const statusCode = 404;

      // Log no logs found
      logWithMeta("warn", `No logs found for hospital ID ${hospitalId} and error code ${errorCode}`, {
        logId,
        hospitalId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'No logs found for the given hospitalId and errorCode'
        }
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the success response
    logWithMeta("info", `Retrieved logs for hospital ID ${hospitalId} and error code ${errorCode} successfully`, {
      logId,
      hospitalId,
      clientIp,
      userAgent,
      apiName,
      method,
      executionTime
    }, {
      logCount: logs.length
    });

    // Return the found logs
    return res.status(200).json({
      meta: {
        statusCode: 200,
        logId,
        executionTime
      },
      data: logs
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCodeResponse = 1211;
    const statusCode = 500;

    // Log the error
    logWithMeta("error", `Error fetching logs for hospital ID ${hospitalId} and error code ${errorCode}`, {
      logId,
      hospitalId,
      clientIp,
      userAgent,
      apiName,
      method,
      errorCode: errorCodeResponse,
      executionTime,
      statusCode,
      error: error.message
    });

    return res.status(statusCode).json({
      meta: {
        statusCode,
        errorCode: errorCodeResponse,
        logId,
        executionTime
      },
      error: {
        message: 'Server Error: ' + error.message
      }
    });
  }
};
  
  
  // exports.getDataByMessage = async (req, res) => {
  //   try {
  //     const { message } = req.query; // Get the message from the query parameters
  //     const { hospitalId } = req.params; // Get hospitalId from the route parameters
  //     const { date } = req.body;
  
  //     // Validate that a message is provided
  //     if (!message) {
  //       return res.status(400).json({ message: 'Message query parameter is required' });
  //     }
  // // Parse the date from the query parameter if provided
  // let queryDate;
  // if (date) {
  //   queryDate = new Date(date);
  //   // Check if the date is valid
  //   if (isNaN(queryDate.getTime())) {
  //     return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
  //   }
  // }
  //     // Get the dynamic collection name (e.g., logs_2024_10_9)
  //     const collectionName = getDynamicCollectionName(queryDate);
  
  //     // Get the model for the dynamic collection
  //     const LogModel = getModel(collectionName);
  
  //     // Build the query object
  //     const query = {
  //       hospitalId: hospitalId, // Ensure hospitalId is part of the query
  //       message: new RegExp(message, 'i') // Use regex for case-insensitive matching
  //     };
  
  //     // Query the dynamic collection
  //     const logs = await LogModel.find(query);
  
  //     // Handle the case where no logs are found
  //     if (!logs || logs.length === 0) {
  //       return res.status(404).json({ message: 'No logs found for the given hospitalId and message' });
  //     }
  
  //     // Return the found logs
  //     return res.status(200).json(logs);
  //   } catch (error) {
  //     // Log the error for debugging
  //     console.error('Error fetching logs:', error);
  
  //     // Return a 500 server error response if something goes wrong
  //     return res.status(500).json({ message: 'Server Error', error });
  //   }
  // };
  
  // exports.getDataByMessage = async (req, res) => {
  //   try {
  //     const { message, date } = req.params; // Extract message and date from params
  //     const { hospitalId } = req.params; // Extract hospitalId from params
  
  //     // Ensure a message and date are provided
  //     if (!message || !date) {
  //       return res.status(400).json({errorCode: 1212, message: 'Both message and date are required' });
  //     }
  
  //     // Parse the date from the params
  //     const queryDate = new Date(date);
  //     if (isNaN(queryDate.getTime())) {
  //       return res.status(400).json({ errorCode: 1213,message: 'Invalid date format. Use YYYY-MM-DD.' });
  //     }
  
  //     // Get the dynamic collection name based on the provided date
  //     const collectionName = getDynamicCollectionName(queryDate);
  //     console.log('Using collection:', collectionName);
  
  //     // Get the model for the dynamic collection
  //     const LogModel = getModel(collectionName);
  
  //     // Build the query object
  //     const query = {
  //       message: new RegExp(message.trim(), 'i'), // Use regex for case-insensitive matching
  //     };
  
  //     // Include hospitalId in the query only if it's provided
  //     if (hospitalId) {
  //       query.hospitalId = String(hospitalId);
  //     }
  
  //     console.log('Built Query:', query);
  
  //     // Query the collection
  //     const logs = await LogModel.find(query);
  
  //     // Handle case where no logs are found
  //     if (!logs || logs.length === 0) {
  //       console.log('No logs found');
  //       return res.status(404).json({errorCode: 1214, message: 'No logs found for the given message and hospitalId (if provided)' });
  //     }
  
  //     // Return the found logs
  //     return res.status(200).json(logs);
  //   } catch (error) {
  //     console.error('Error fetching logs:', error);
  //     return res.status(500).json({ errorCode: 1215,message: 'Server Error', error: error.message });
  //   }
  // };
  exports.getDataByMessage = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4(); // Generate a unique log ID for this request
  
    // Extract metadata from the request
    const { message, date, hospitalId } = req.params;
    const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const apiName = req.originalUrl;
    const method = req.method;
    const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;
  
    try {
      // Ensure a message and date are provided
      if (!message || !date) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCodeResponse = 1212;
        const statusCode = 400;
  
        // Log missing message or date
        logWithMeta("warn", "Message and date are required", {
          logId,
          clientIp,
          userAgent,
          apiName,
          method,
          errorCode: errorCodeResponse,
          executionTime,
          statusCode,
          authorization
        });
  
        return res.status(statusCode).json({
          meta: {
            statusCode,
            errorCode: errorCodeResponse,
            logId,
            executionTime
          },
          error: {
            message: 'Both message and date are required'
          }
        });
      }
  
      // Parse the date from the params
      const queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCodeResponse = 1213;
        const statusCode = 400;
  
        // Log invalid date format
        logWithMeta("warn", "Invalid date format", {
          logId,
          clientIp,
          userAgent,
          apiName,
          method,
          errorCode: errorCodeResponse,
          executionTime,
          statusCode,
          authorization
        });
  
        return res.status(statusCode).json({
          meta: {
            statusCode,
            errorCode: errorCodeResponse,
            logId,
            executionTime
          },
          error: {
            message: 'Invalid date format. Use YYYY-MM-DD.'
          }
        });
      }
  
      // Get the dynamic collection name based on the provided date
      const collectionName = getDynamicCollectionName(queryDate);
      console.log('Using collection:', collectionName);
  
      // Get the model for the dynamic collection
      const LogModel = getModel(collectionName);
  
      // Build the query object
      const query = {
        message: new RegExp(message.trim(), 'i'), // Use regex for case-insensitive matching
      };
  
      // Include hospitalId in the query if provided
      if (hospitalId) {
        query.hospitalId = String(hospitalId);
      }
  
      console.log('Built Query:', query);
  
      // Query the collection
      const logs = await LogModel.find(query);
  
      // Handle case where no logs are found
      if (!logs || logs.length === 0) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCodeResponse = 1214;
        const statusCode = 404;
  
        // Log no logs found
        logWithMeta("warn", `No logs found for message: ${message} and hospital ID: ${hospitalId}`, {
          logId,
          clientIp,
          userAgent,
          apiName,
          method,
          errorCode: errorCodeResponse,
          executionTime,
          statusCode,
          authorization
        });
  
        return res.status(statusCode).json({
          meta: {
            statusCode,
            errorCode: errorCodeResponse,
            logId,
            executionTime
          },
          error: {
            message: 'No logs found for the given message and hospitalId (if provided)'
          }
        });
      }
  
      const end = Date.now();
      const executionTime = `${end - start}ms`;
  
      // Log successful response
      logWithMeta("info", `Logs retrieved successfully for message: ${message}`, {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        executionTime
      }, {
        logCount: logs.length
      });
  
      // Return the found logs
      return res.status(200).json({
        meta: {
          statusCode: 200,
          logId,
          executionTime
        },
        data: logs
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1215;
      const statusCode = 500;
  
      // Log server error
      logWithMeta("error", `Error fetching logs for message: ${message}`, {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        error: error.message
      });
  
      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Server Error: ' + error.message
        }
      });
    }
  };
  
// Controller function to get logs by timestamp and date
// exports.getDataByTimestampAndDate = async (req, res) => {
//   try {
//     // Extract date and timestamp from request parameters
//     const { date, timestamp } = req.params;

//     // Ensure date and timestamp are provided
//     if (!date || !timestamp) {
//       return res.status(400).json({ errorCode: 1216,message: 'Both date and timestamp are required' });
//     }

//     // Parse the date from the parameters
//     const queryDate = new Date(date);
//     if (isNaN(queryDate.getTime())) {
//       return res.status(400).json({errorCode: 1217, message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Parse the timestamp from the parameters
//     const queryTimestamp = new Date(timestamp);
//     if (isNaN(queryTimestamp.getTime())) {
//       return res.status(400).json({ errorCode: 1218,message: 'Invalid timestamp format. Use ISO format or valid date format.' });
//     }

//     // Get the dynamic collection name based on the provided date
//     const collectionName = getDynamicCollectionName(queryDate);
//     console.log('Using collection:', collectionName);

//     // Get the model for the dynamic collection
//     const LogModel = getModel(collectionName);

//     // Query the collection by timestamp
//     const logs = await LogModel.find({
//       timestamp: { $eq: queryTimestamp }, // Query exact match for the timestamp
//     });

//     // Handle case where no logs are found
//     if (!logs || logs.length === 0) {
//       return res.status(404).json({errorCode: 1219, message: 'No logs found for the provided date and timestamp' });
//     }

//     // Return the found logs
//     return res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     return res.status(500).json({errorCode: 1220,message: 'Server Error', error });
//   }
// };
exports.getDataByTimestampAndDate = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4(); // Generate a unique log ID for this request

  // Extract metadata from the request
  const { date, timestamp } = req.params;
  const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const apiName = req.originalUrl;
  const method = req.method;
  const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;

  try {
    // Ensure date and timestamp are provided
    if (!date || !timestamp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1216;
      const statusCode = 400;

      // Log missing date or timestamp
      logWithMeta("warn", "Date and timestamp are required", {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Both date and timestamp are required'
        }
      });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1217;
      const statusCode = 400;

      // Log invalid date format
      logWithMeta("warn", "Invalid date format", {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD.'
        }
      });
    }

    // Parse the timestamp from the parameters
    const queryTimestamp = new Date(timestamp);
    if (isNaN(queryTimestamp.getTime())) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1218;
      const statusCode = 400;

      // Log invalid timestamp format
      logWithMeta("warn", "Invalid timestamp format", {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'Invalid timestamp format. Use ISO format or valid date format.'
        }
      });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    console.log('Using collection:', collectionName);

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Query the collection by timestamp
    const logs = await LogModel.find({
      timestamp: { $eq: queryTimestamp }, // Query exact match for the timestamp
    });

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1219;
      const statusCode = 404;

      // Log no logs found
      logWithMeta("warn", "No logs found for provided date and timestamp", {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'No logs found for the provided date and timestamp'
        }
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log successful retrieval
    logWithMeta("info", `Logs retrieved successfully for date: ${date} and timestamp: ${timestamp}`, {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      executionTime
    }, {
      logCount: logs.length
    });

    // Return the found logs
    return res.status(200).json({
      meta: {
        statusCode: 200,
        logId,
        executionTime
      },
      data: logs
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCodeResponse = 1220;
    const statusCode = 500;

    // Log server error
    logWithMeta("error", `Error fetching logs for date: ${date} and timestamp: ${timestamp}`, {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      errorCode: errorCodeResponse,
      executionTime,
      statusCode,
      error: error.message
    });

    return res.status(statusCode).json({
      meta: {
        statusCode,
        errorCode: errorCodeResponse,
        logId,
        executionTime
      },
      error: {
        message: 'Server Error: ' + error.message
      }
    });
  }
};

// Controller function to get logs by logId and date
// exports.getDataByLogIdAndDate = async (req, res) => {
//   try {
//     // Extract date and logId from request parameters
//     const { date, logId } = req.params;

//     // Ensure both date and logId are provided
//     if (!date || !logId) {
//       return res.status(400).json({ errorCode: 1221,message: 'Both date and logId are required' });
//     }

//     // Parse the date from the parameters
//     const queryDate = new Date(date);
//     if (isNaN(queryDate.getTime())) {
//       return res.status(400).json({ errorCode: 1222,message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Get the dynamic collection name based on the provided date
//     const collectionName = getDynamicCollectionName(queryDate);
//     console.log('Using collection:', collectionName);

//     // Get the model for the dynamic collection
//     const LogModel = getModel(collectionName);

//     // Build the query object for logId
//     const query = {
//       logId: logId, // Ensure logId is passed directly as it should match the exact value
//     };

//     // Query the collection by logId
//     const logs = await LogModel.find(query);

//     // Handle case where no logs are found
//     if (!logs || logs.length === 0) {
//       return res.status(404).json({ errorCode: 1223,message: 'No logs found for the provided date and logId' });
//     }

//     // Return the found logs
//     return res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     return res.status(500).json({ errorCode: 1224,message: 'Server Error', error });
//   }
// };

exports.getDataByLogIdAndDate = async (req, res) => {
  const requestId = uuidv4(); // Generate a unique ID for this request for tracing logs

  try {
    // Extract date and logId from request parameters
    const { date, logId } = req.params;

    // Ensure both date and logId are provided
    if (!date || !logId) {
      logWithMeta('warn', 'Missing date or logId in request parameters.', { requestId, errorCode: 1221 });
      return res.status(400).json({ errorCode: 1221, message: 'Both date and logId are required' });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      logWithMeta('warn', 'Invalid date format provided.', { requestId, errorCode: 1222, date });
      return res.status(400).json({ errorCode: 1222, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    logWithMeta('info', `Using collection '${collectionName}' for querying logs.`, { requestId, collectionName });

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Build the query object for logId
    const query = { logId };

    // Query the collection by logId
    const logs = await LogModel.find(query);

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      logWithMeta('info', 'No logs found for the provided date and logId.', { requestId, errorCode: 1223, date, logId });
      return res.status(404).json({ errorCode: 1223, message: 'No logs found for the provided date and logId' });
    }

    // Log the number of logs retrieved
    logWithMeta('info', `Retrieved ${logs.length} logs from collection '${collectionName}'.`, { requestId, collectionName });

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    logWithMeta('error', 'Error fetching logs.', { requestId, errorCode: 1224, error: error.message });
    return res.status(500).json({ errorCode: 1224, message: 'Server Error', error: error.message });
  }
};

// Controller function to get all logs using date as the collection name
// exports.getAllData = async (req, res) => {
//   try {
//     // Extract date from request parameters
//     const { date } = req.params;

//     // Ensure the date is provided
//     if (!date) {
//       return res.status(400).json({errorCode: 1225, message: 'Date is required' });
//     }

//     // Parse the date from the parameters
//     const queryDate = new Date(date);
//     if (isNaN(queryDate.getTime())) {
//       return res.status(400).json({ errorCode: 1226,message: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Get the dynamic collection name based on the provided date
//     const collectionName = getDynamicCollectionName(queryDate);
//     console.log('Using collection:', collectionName);

//     // Get the model for the dynamic collection
//     const LogModel = getModel(collectionName);

//     // Query the collection to get all logs for that date
//     const logs = await LogModel.find({}); // Fetching all logs in the collection

//     // Handle case where no logs are found
//     if (!logs || logs.length === 0) {
//       return res.status(404).json({errorCode: 1227, message: 'No logs found for the provided date' });
//     }

//     // Return the found logs
//     return res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     return res.status(500).json({errorCode: 1228, message: 'Server Error', error: error.message });
//   }
// };
exports.getAllData = async (req, res) => {
  const logId = uuidv4(); // Generate unique log ID for tracing this request

  try {
    // Extract date from request parameters
    const { date } = req.params;

    // Ensure the date is provided
    if (!date) {
      logWithMeta('warn', 'Date is required but not provided.', { logId, errorCode: 1225 });
      return res.status(400).json({ errorCode: 1225, message: 'Date is required' });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      logWithMeta('warn', 'Invalid date format provided.', { logId, errorCode: 1226, date });
      return res.status(400).json({ errorCode: 1226, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    logWithMeta('info', `Using collection '${collectionName}' for querying logs.`, { logId, collectionName });

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Query the collection to get all logs for that date
    const logs = await LogModel.find({}); // Fetching all logs in the collection

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      logWithMeta('info', 'No logs found for the provided date.', { logId, errorCode: 1227, date });
      return res.status(404).json({ errorCode: 1227, message: 'No logs found for the provided date' });
    }

    // Log the number of logs retrieved
    logWithMeta('info', `Retrieved ${logs.length} logs from collection '${collectionName}'.`, { logId, collectionName });

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    logWithMeta('error', 'Error fetching logs.', { logId, errorCode: 1228, error: error.message });
    return res.status(500).json({ errorCode: 1228, message: 'Server Error', error: error.message });
  }
};

// Function to get or create a model for a specific collection name
// const getModelName = (collectionName) => {
//   if (mongoose.models[collectionName]) {
//     return mongoose.models[collectionName]; // Return existing model
//   } else {
//     // Create a new model if it doesn't exist
//     return mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
//   }
// };




const getModelName = (collectionName) => {
  const logId = uuidv4(); // Generate a unique log ID for this operation

  try {
    // Check if the model already exists in Mongoose
    if (mongoose.models[collectionName]) {
      logWithMeta("info", `Model for collection '${collectionName}' already exists.`, {
        logId,
        collectionName
      });
      return mongoose.models[collectionName]; // Return existing model
    } else {
      // Log model creation process
      logWithMeta("info", `Creating new model for collection: '${collectionName}'`, {
        logId,
        collectionName
      });

      // Create a new model with a flexible schema (strict: false allows dynamic fields)
      const newModel = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);

      // Log success of model creation
      logWithMeta("info", `Successfully created new model for collection: '${collectionName}'`, {
        logId,
        collectionName
      });

      return newModel; // Return newly created model
    }
  } catch (error) {
    // Log error during model creation or retrieval
    logWithMeta("error", `Error creating or retrieving model for collection: '${collectionName}'`, {
      logId,
      collectionName,
      error: error.message
    });

    throw new Error(`Error creating or retrieving model for collection: ${collectionName} - ${error.message}`);
  }
};

// Controller function to get all logs from all collections
// exports.getAllDataFromAllCollections = async (req, res) => {
//   try {
//     // Get the names of all collections in the database
//     const collections = await mongoose.connection.db.listCollections().toArray();

//     // Filter collections that match the logs_* format
//     const logCollections = collections
//       .map(col => col.name)
//       .filter(name => name.startsWith('logs_'));

//     let allLogs = [];

//     // Iterate over each log collection and fetch logs
//     for (const collectionName of logCollections) {
//       const LogModel = getModelName(collectionName); // Get or create the model

//       // Fetch logs from the current collection
//       const logs = await LogModel.find({});
//       allLogs = allLogs.concat(logs); // Combine logs from all collections
//     }

//     // Handle case where no logs are found in all collections
//     if (allLogs.length === 0) {
//       return res.status(404).json({errorCode: 1229, message: 'No logs found in any collection' });
//     }

//     // Return all found logs
//     return res.status(200).json(allLogs);
//   } catch (error) {
//     console.error('Error fetching logs from all collections:', error);
//     return res.status(500).json({errorCode: 1230, message: 'Server Error', error: error.message });
//   }
// };


exports.getAllDataFromAllCollections = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4(); // Generate a unique log ID for this request

  // Extract metadata from the request
  const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const apiName = req.originalUrl;
  const method = req.method;
  const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;

  try {
    // Log starting process of fetching all collections
    logWithMeta("info", "Fetching all collections from database", {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      authorization
    });

    // Get the names of all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Filter collections that match the logs_* format
    const logCollections = collections
      .map(col => col.name)
      .filter(name => name.startsWith('logs_'));

    // Log the filtered collections
    logWithMeta("info", "Filtered log collections", {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      collections: logCollections,
      authorization
    });

    let allLogs = [];

    // Iterate over each log collection and fetch logs
    for (const collectionName of logCollections) {
      const LogModel = getModelName(collectionName); // Get or create the model

      // Log start of fetching logs from each collection
      logWithMeta("info", `Fetching logs from collection: ${collectionName}`, {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        collectionName,
        authorization
      });

      // Fetch logs from the current collection
      const logs = await LogModel.find({});
      allLogs = allLogs.concat(logs); // Combine logs from all collections

      // Log the number of logs fetched from the collection
      logWithMeta("info", `Fetched ${logs.length} logs from collection: ${collectionName}`, {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        collectionName,
        authorization
      });
    }

    // Handle case where no logs are found in all collections
    if (allLogs.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCodeResponse = 1229;
      const statusCode = 404;

      // Log no logs found
      logWithMeta("warn", "No logs found in any collection", {
        logId,
        clientIp,
        userAgent,
        apiName,
        method,
        errorCode: errorCodeResponse,
        executionTime,
        statusCode,
        authorization
      });

      return res.status(statusCode).json({
        meta: {
          statusCode,
          errorCode: errorCodeResponse,
          logId,
          executionTime
        },
        error: {
          message: 'No logs found in any collection'
        }
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log successful retrieval of logs
    logWithMeta("info", "Successfully fetched logs from all collections", {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      executionTime,
      authorization
    }, {
      logCount: allLogs.length
    });

    // Return all found logs
    return res.status(200).json({
      meta: {
        statusCode: 200,
        logId,
        executionTime
      },
      data: allLogs
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCodeResponse = 1230;
    const statusCode = 500;

    // Log server error
    logWithMeta("error", "Error fetching logs from all collections", {
      logId,
      clientIp,
      userAgent,
      apiName,
      method,
      errorCode: errorCodeResponse,
      executionTime,
      statusCode,
      authorization,
      error: error.message
    });

    return res.status(statusCode).json({
      meta: {
        statusCode,
        errorCode: errorCodeResponse,
        logId,
        executionTime
      },
      error: {
        message: 'Server Error: ' + error.message
      }
    });
  }
};

  
  

  