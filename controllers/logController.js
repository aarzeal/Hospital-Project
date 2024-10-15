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










// Function to get the dynamic collection name based on date or other logic
function getDynamicCollectionName(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-based, so add 1
  const day = date.getDate(); // Get the day without padding

  return `logs_${year}_${month}_${day}`; // Example: logs_2024_10_9
}



exports.getDataByHospitalId = async (req, res) => {
  try {
    const { hospitalId } = req.params; // Get hospitalId from the URL parameters
    const { date } = req.query; // Get date from the query parameters

    // Ensure date is provided
    if (!date) {
      return res.status(400).json({errorCode: 1204, message: 'Date is required' });
    }

    // Parse the date from the query parameter
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({errorCode: 1205, message: 'Invalid date format. Use YYYY-MM-DD.' });
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
      return res.status(404).json({ message: 'No logs found for this hospitalId on the provided date' });
    }

    // Return the data
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({errorCode: 1206, message: 'Server Error', error: error.message });
  }
};


exports.getDataByErrorCode = async (req, res) => {
  try {
    const { hospitalId, errorCode, date } = req.params;

    // Validate errorCode
    if (!errorCode || isNaN(Number(errorCode))) {
      return res.status(400).json({errorCode: 1207, message: 'Invalid or missing errorCode' });
    }
    
    // Validate date
    if (!date) {
      return res.status(400).json({errorCode: 1208, message: 'Date is required' });
    }

    // Parse the date
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ errorCode: 1209,message: 'Invalid date format. Use YYYY-MM-DD.' });
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
      return res.status(404).json({ errorCode: 1210,message: 'No logs found for the given hospitalId and errorCode' });
    }

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ errorCode: 1211,message: 'Server Error', error: error.message });
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
  
  exports.getDataByMessage = async (req, res) => {
    try {
      const { message, date } = req.params; // Extract message and date from params
      const { hospitalId } = req.params; // Extract hospitalId from params
  
      // Ensure a message and date are provided
      if (!message || !date) {
        return res.status(400).json({errorCode: 1212, message: 'Both message and date are required' });
      }
  
      // Parse the date from the params
      const queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
        return res.status(400).json({ errorCode: 1213,message: 'Invalid date format. Use YYYY-MM-DD.' });
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
  
      // Include hospitalId in the query only if it's provided
      if (hospitalId) {
        query.hospitalId = String(hospitalId);
      }
  
      console.log('Built Query:', query);
  
      // Query the collection
      const logs = await LogModel.find(query);
  
      // Handle case where no logs are found
      if (!logs || logs.length === 0) {
        console.log('No logs found');
        return res.status(404).json({errorCode: 1214, message: 'No logs found for the given message and hospitalId (if provided)' });
      }
  
      // Return the found logs
      return res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ errorCode: 1215,message: 'Server Error', error: error.message });
    }
  };
  
// Controller function to get logs by timestamp and date
exports.getDataByTimestampAndDate = async (req, res) => {
  try {
    // Extract date and timestamp from request parameters
    const { date, timestamp } = req.params;

    // Ensure date and timestamp are provided
    if (!date || !timestamp) {
      return res.status(400).json({ errorCode: 1216,message: 'Both date and timestamp are required' });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({errorCode: 1217, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Parse the timestamp from the parameters
    const queryTimestamp = new Date(timestamp);
    if (isNaN(queryTimestamp.getTime())) {
      return res.status(400).json({ errorCode: 1218,message: 'Invalid timestamp format. Use ISO format or valid date format.' });
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
      return res.status(404).json({errorCode: 1219, message: 'No logs found for the provided date and timestamp' });
    }

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({errorCode: 1220,message: 'Server Error', error });
  }
};


// Controller function to get logs by logId and date
exports.getDataByLogIdAndDate = async (req, res) => {
  try {
    // Extract date and logId from request parameters
    const { date, logId } = req.params;

    // Ensure both date and logId are provided
    if (!date || !logId) {
      return res.status(400).json({ errorCode: 1221,message: 'Both date and logId are required' });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ errorCode: 1222,message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    console.log('Using collection:', collectionName);

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Build the query object for logId
    const query = {
      logId: logId, // Ensure logId is passed directly as it should match the exact value
    };

    // Query the collection by logId
    const logs = await LogModel.find(query);

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      return res.status(404).json({ errorCode: 1223,message: 'No logs found for the provided date and logId' });
    }

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ errorCode: 1224,message: 'Server Error', error });
  }
};

// Controller function to get all logs using date as the collection name
exports.getAllData = async (req, res) => {
  try {
    // Extract date from request parameters
    const { date } = req.params;

    // Ensure the date is provided
    if (!date) {
      return res.status(400).json({errorCode: 1225, message: 'Date is required' });
    }

    // Parse the date from the parameters
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ errorCode: 1226,message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Get the dynamic collection name based on the provided date
    const collectionName = getDynamicCollectionName(queryDate);
    console.log('Using collection:', collectionName);

    // Get the model for the dynamic collection
    const LogModel = getModel(collectionName);

    // Query the collection to get all logs for that date
    const logs = await LogModel.find({}); // Fetching all logs in the collection

    // Handle case where no logs are found
    if (!logs || logs.length === 0) {
      return res.status(404).json({errorCode: 1227, message: 'No logs found for the provided date' });
    }

    // Return the found logs
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({errorCode: 1228, message: 'Server Error', error: error.message });
  }
};


// Function to get or create a model for a specific collection name
const getModelName = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName]; // Return existing model
  } else {
    // Create a new model if it doesn't exist
    return mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
  }
};

// Controller function to get all logs from all collections
exports.getAllDataFromAllCollections = async (req, res) => {
  try {
    // Get the names of all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Filter collections that match the logs_* format
    const logCollections = collections
      .map(col => col.name)
      .filter(name => name.startsWith('logs_'));

    let allLogs = [];

    // Iterate over each log collection and fetch logs
    for (const collectionName of logCollections) {
      const LogModel = getModelName(collectionName); // Get or create the model

      // Fetch logs from the current collection
      const logs = await LogModel.find({});
      allLogs = allLogs.concat(logs); // Combine logs from all collections
    }

    // Handle case where no logs are found in all collections
    if (allLogs.length === 0) {
      return res.status(404).json({errorCode: 1229, message: 'No logs found in any collection' });
    }

    // Return all found logs
    return res.status(200).json(allLogs);
  } catch (error) {
    console.error('Error fetching logs from all collections:', error);
    return res.status(500).json({errorCode: 1230, message: 'Server Error', error: error.message });
  }
};




  
  

  