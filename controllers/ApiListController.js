const ApisList = require('../models/ApiListModel');
const logger = require('../logger'); // Make sure to import your logger
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1111 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// Get all Apis
exports.getAllApis = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
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

      const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", `Apis fetched successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
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
    const errorCode = 1112;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching APIs ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    return res.status(500).json({
      meta: {
        errorCode: 1112,
        status: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Get Api by ID
exports.getApiById = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  const { id } = req.params;

  try {
    const api = await ApisList.findByPk(id);

    if (!api) {
      // logger.warn(`API with ID ${id} not found`, { errorCode: 1105 });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1113;
  
      // Log the warning
      logger.logWithMeta("warn", `API with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });


      return res.status(404).json({
        meta: {
          errorCode: 1113,
          status: 404,
          message: 'API not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Log success message
    // logger.info(`Successfully fetched API with ID ${id}`, { api });
    const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", `Successfully fetched API with ID ${id}`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });

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
      const errorCode = 1114;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching API by ID ${id} ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

    return res.status(500).json({
      meta: {
        errorCode: 1114,
        status: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }
    });
  }
};
