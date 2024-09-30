const ApisList = require('../models/ApiListModel');
const logger = require('../logger'); // Make sure to import your logger

// Get all Apis
exports.getAllApis = async (req, res) => {
  try {
    const apis = await ApisList.findAll();

    // Log success message
    logger.info('Successfully fetched all APIs', { apisCount: apis.length });
    if (apis.length === 0) {
        logger.info('No APIs available');
        return res.status(200).json({
          meta: {
            status: 200,
            message: 'No APIs are available',
            totalRecords: 0,
            timestamp: new Date().toISOString()
          },
          data: []
        });
      }

    return res.status(200).json({
      meta: {
        status: 200,
        message: 'Apis fetched successfully',
        totalRecords: apis.length,
        timestamp: new Date().toISOString()
      },
      data: apis
    });
  } catch (error) {
    // logger.error('Error fetching APIs', { errorCode: 1104, error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1104;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `Error fetching APIs:${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });

    return res.status(500).json({
      meta: {
        errorCode: 1104,
        status: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Get Api by ID
exports.getApiById = async (req, res) => {
  const { id } = req.params;

  try {
    const api = await ApisList.findByPk(id);

    if (!api) {
      // logger.warn(`API with ID ${id} not found`, { errorCode: 1105 });
      const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1105;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `API with ID ${id} not found:${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });


      return res.status(404).json({
        meta: {
          errorCode: 1105,
          status: 404,
          message: 'API not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Log success message
    logger.info(`Successfully fetched API with ID ${id}`, { api });

    return res.status(200).json({
      meta: {
        status: 200,
        message: 'API fetched successfully',
        timestamp: new Date().toISOString()
      },
      data: api
    });
  } catch (error) {
    // logger.error(`Error fetching API by ID ${id}`, { errorCode: 1106, error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1106;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `Error fetching API by ID ${id}:${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });

    return res.status(500).json({
      meta: {
        errorCode: 1106,
        status: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }
    });
  }
};
