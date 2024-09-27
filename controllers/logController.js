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

  // Check if the model already exists to avoid redefining
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