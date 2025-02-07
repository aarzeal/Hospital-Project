const submodule = require("../models/MasterSubmodule");
const { Sequelize } = require("sequelize");
const logger = require('../logger');
const dotenv = require('dotenv');
  
// Get all modules or a single module by ID
dotenv.config();
async function getClientIp(req) {
  // Get client IP from headers or request
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;

  // Check if the IP is a local or private network
  if (clientIp === '' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      // Fetch the public IP dynamically using ipify if it's local/private
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      // Log error if fetching the public IP fails
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1135 });

      // Fallback to localhost if API call fails
      clientIp = '127.0.0.1';
    }
  }

  return clientIp;
}

exports.getSubModules = async (req, res) => {
  try {
    const submoduleId = req.params.id;

    let result;
    if (submoduleId) {
      result = await submodule.findByPk(submoduleId);
      if (!result) {
        return res.status(404).json({ success: false, message: "subModule not found" });
      }
    } else {
      result = await submodule.findAll();
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching submodules:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
exports.ensureSequelizeInstance = (req, res, next) => {
  const start = Date.now();

  const hospitalDatabase = req.headers["hospitaldatabase"]; // Fetch from headers (case-sensitive)

  if (!hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 937;
    const statusCode = 500;

    logger.logWithMeta("warn", "Database connection not established", {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(statusCode).json({
      meta: { statusCode, errorCode, executionTime },
      error: { message: "Database connection not established" },
    });
  }

  // Create a Sequelize instance dynamically
  const sequelize = new Sequelize(hospitalDatabase, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Disable Sequelize logs for cleaner output
  });

  req.sequelize = sequelize; // Attach to the request object

  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connection established successfully000000.");
      next(); // Proceed to the next middleware
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 938, executionTime: `${Date.now() - start}ms` },
        error: { message: "Failed to connect to database" },
      });
    });
};

exports.createSubmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { submodule_name, modules_Id } = req.body;
  // const hospitalId = req.hospitalId;

  try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

      // Ensure the table exists
      await UserSubModules.sync();

      const userSubModules = await UserSubModules.create({ submodule_name, modules_Id });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `Submodule created successfully with name: ${submodule_name}`, {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Submodule created successfully with name: ${submodule_name}, hospitalId: ${hospitalId}, executionTime: ${end - start}ms`);

      res.status(200).json({
          meta: {
              statusCode: 200,
              executionTime: `${end - start}ms`
          },
          data: {
              submodule_id: userSubModules.submodule_id,
              submodule_name: userSubModules.submodule_name,
              modules_Id: userSubModules.modules_Id
          }
      });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1144;
    
    // Log the warning
    logger.logWithMeta("warn", `Error creating submodules `, {
      errorCode,
      
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      statusCode: 500,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    //   logger.error('Error creating submodules', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 1144,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Error creating submodules: ' + error.message
          }
      });
  }
};

exports.getSubModule = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { submodule_id } = req.query;

  console.log("submodule_id", submodule_id);

  try {
    const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
    const userSubModules = await UserSubModules.findByPk(submodule_id);

    if (!userSubModules) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1145;

      logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found`, {
        errorCode,
        executionTime,
        statusCode: 404,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: 'Submodule not found',
        },
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta("info", `Submodule with ID ${submodule_id} retrieved successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      statusCode: 200,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        submodule_id: userSubModules.submodule_id,
        submodule_name: userSubModules.submodule_name,
        modules_Id: userSubModules.modules_Id,
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1146;

    logger.logWithMeta("error", `Error retrieving submodule with ID ${submodule_id}`, {
      errorCode,
      statusCode: 500,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      errorMessage: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: 'Error retrieving submodules: ' + error.message,
      },
    });
  }
};
exports.getAllSubModules = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
  
    try {
        const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
        
        // Retrieve all submodules
        const userSubModules = await UserSubModules.findAll();
  
        if (!userSubModules || userSubModules.length === 0) {
          const end = Date.now();
          const executionTime = `${end - start}ms`;
          const errorCode = 1147;
          
          // Log the warning
          logger.logWithMeta("warn", `No submodules found `, {
            errorCode,
            statusCode: 404,
            
            executionTime,
            hospitalId: req.hospitalId,
            ip: clientIp,
            apiName: req.originalUrl, // API name
            method: req.method,
            userAgent: req.headers['user-agent'],     // HTTP method
          });
            // logger.warn(`No submodules found, executionTime: ${end - start}ms`);
            return res.status(404).json({
                meta: {
                    statusCode: 404,
                    errorCode: 1147,
                    executionTime: `${end - start}ms`
                },
                error: {
                    message: 'No submodules found'
                }
            });
        }
  
        
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `All submodules retrieved successfully`, {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
        // logger.info(`All submodules retrieved successfully, executionTime: ${end - start}ms`);
  
        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime: `${end - start}ms`
            },
            data: userSubModules.map(submodule => ({
                submodule_id: submodule.submodule_id,
                submodule_name: submodule.submodule_name,
                modules_Id: submodule.modules_Id
            }))
        });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1148;
      
      // Log the warning
      logger.logWithMeta("warn", `Error retrieving all submodules `, {
        errorCode,
        statusCode: 500,
        
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
        // logger.error('Error retrieving all submodules', { error: error.message, executionTime: `${end - start}ms` });
        res.status(500).json({
            meta: {
                statusCode: 500,
                errorCode: 1148,
                executionTime: `${end - start}ms`
            },
            error: {
                message: 'Error retrieving all submodules: ' + error.message
            }
        });
    }
  };
  

  exports.updateSubModule = async (req, res) => {
    const clientIp = await getClientIp(req);
    const start = Date.now();
  
    const { submodule_name } = req.body;

    const { submodule_id } = req.query;

    console.log('Request Params:', req.params);
console.log('Request Body:', req.body);
  
    try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
      const userSubModules = await UserSubModules.findByPk(submodule_id);
  
      if (!userSubModules) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1149;
        
        // Log the warning
        logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found `, {
          errorCode,
          statusCode: 404,
          
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
        // logger.warn(`Submodule with ID ${submodule_id} not found, executionTime: ${end - start}ms`);
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 1149,
            executionTime: `${end - start}ms`,
          },
          error: {
            message: 'Submodule not found',
          },
        });
      }
  
      if (submodule_name) {
        userSubModules.submodule_name = submodule_name;
      }
  
      await userSubModules.save();
  
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `Submodule with ID ${submodule_id} updated successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        statusCode: 200,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Submodule with ID ${submodule_id} updated successfully, executionTime: ${end - start}ms`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`,
        },
        data: {
          submodule_id: userSubModules.submodule_id,
          submodule_name: userSubModules.submodule_name,
        },
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1150;
      
      // Log the warning
      logger.logWithMeta("warn", `Error updating submodule `, {
        errorCode,
        statusCode: 500,
        
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    //   logger.error('Error updating submodule', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 1150,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: 'Error updating submodule: ' + error.message,
        },
      });
    }
  };
  

