
const Module = require("../models/masterModule");
const logger = require('../logger');
const bcrypt = require('bcryptjs');
// Assuming logger is configured properly in '../logger'
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
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

exports.getModules = async (req, res) => {
  try {
    const moduleId = req.params.id;

    let result;
    if (moduleId) {
      result = await Module.findByPk(moduleId);
      if (!result) {
        return res.status(404).json({ success: false, message: "Module not found" });
      }
    } else {
      result = await Module.findAll();
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
// exports.ensureSequelizeInstance = (req, res, next) => {
//   const start = Date.now();
//   // const clientIp = await getClientIp(req);
//   // const hospitalDatabase ="sampledb"
//   const hospitalDatabase = req.body

//   if (!hospitalDatabase) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 937;
//     const statusCode = 500;
//     // Log the warning
//     logger.logWithMeta("warn", `Database connection not established`, {
//       errorCode,
//       statusCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       // ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

//     return res.status(statusCode).json({
//       meta: {
//         statusCode: statusCode,
//         errorCode: 937,
//         executionTime: `${end - start}ms`,
//       },

//       error: {
//         message: "Database connection not established",
//       },
//     });
//   }

//   const sequelize = new Sequelize(
//     hospitalDatabase,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       dialect: process.env.DB_DIALECT,
//     }
//   );

//   req.sequelize = sequelize;
//   // logger.info('Sequelize instance created successfully');
//   const end = Date.now();
//   const executionTime = `${end - start}ms`;
//   // Log the warning
//   // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
//   //   executionTime,
//   //   statusCode: 200,
//   //   hospitalId: req.hospitalId,
//   //   // ip: clientIp,
//   //   apiName: req.originalUrl, // API name
//   //   method: req.method,
//   //   userAgent: req.headers["user-agent"], // HTTP method
//   // });
//   next();

//   sequelize
//     .sync({ alter: true })
//     .then(() => {
//       console.log("Database synchronized successfully.");
//     })
//     .catch((error) => {
//       console.error("Error synchronizing the database:", error);
//     });
// };


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
exports.creatmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
    const { modules_name } = req.body;
    // const hospitalId = req.hospitalId;
  
    try {
     
     
      const UserModules = require('../models/HospitalModules')(req.sequelize);
  
      // Ensure the table exists
      await UserModules.sync();
  
      const userModules = await UserModules.create({ modules_name  });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `User created successfully with username: ${modules_name}`, {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`User created successfully with username: ${modules_name}, hospitalId: ${hospitalId}, executionTime: ${end - start}ms`);
  
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: {
            modules_Id: userModules.modules_Id,
          modules_name: userModules.modules_name
        }
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1136;
      
      // Log the warning
      logger.logWithMeta("warn", `Error creating Modules ${error.message}`, {
        errorCode,
        statusCode: 500,
        errorMessage: error.message,
        executionTime,
        // hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error('Error creating Modules',{ errorCode }, { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 1136,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error creating modules: ' + error.message
        }
      });
    }
  };
  exports.getModule = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { modules_Id } = req.query; // Retrieve from query parameters
  
    console.log(modules_Id);
  
    try {
      if (!modules_Id) {
        return res.status(400).json({
          meta: { statusCode: 400, errorCode: 1136, executionTime: `${Date.now() - start}ms` },
          error: { message: "modules_Id is required in query parameters" },
        });
      }
  
      const UserModules = require("../models/HospitalModules")(req.sequelize);
      const userModules = await UserModules.findByPk(modules_Id);
  
      if (!userModules) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1137;
  
        logger.logWithMeta("warn", `Module with ID ${modules_Id} not found`, {
          errorCode,
          statusCode: 404,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
  
        return res.status(404).json({
          meta: { statusCode: 404, errorCode, executionTime },
          error: { message: "Module not found" },
        });
      }
  
      const end = Date.now();
      const executionTime = `${end - start}ms`;
  
      logger.logWithMeta("info", `Module with ID ${modules_Id} retrieved successfully`, {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        data: {
          modules_Id: userModules.modules_Id,
          modules_name: userModules.modules_name,
        },
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1138;
  
      logger.logWithMeta("error", "Error retrieving Module", {
        errorCode,
        statusCode: 500,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime },
        error: { message: "Error retrieving Module" },
      });
    }
  };
    exports.getAllModules = async (req, res) => {
      const start = Date.now();
      const clientIp = await getClientIp(req);
      
      try {
        const UserModules = require('../models/HospitalModules')(req.sequelize);
    
        // Fetch all modules
        const allModules = await UserModules.findAll();
    
        // If no modules found
        if (!allModules || allModules.length === 0) {
          const end = Date.now();
          const executionTime = `${end - start}ms`;
          const errorCode = 1139;
          
          // Log the warning
          logger.logWithMeta("warn", `No modules found ${error.message}`, {
            errorCode,
            errorMessage: error.message,
            executionTime,
            hospitalId: req.hospitalId,
            statusCode: 404,
            ip: clientIp,
            apiName: req.originalUrl, // API name
            method: req.method,
            userAgent: req.headers['user-agent'],     // HTTP method
          });
          // logger.warn(`No modules found, executionTime: ${end - start}ms`);
          return res.status(404).json({
            meta: {
              statusCode: 404,
              errorCode: 1139,
              executionTime: `${end - start}ms`
            },
            error: {
              message: 'No modules found'
            }
          });
        }
    
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        // Log the warning
        logger.logWithMeta("warn", `Modules retrieved successfully`, {
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          statusCode: 200,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],    // HTTP method
        });
        logger.info(`Modules retrieved successfully, executionTime: ${end - start}ms`);
        
        // Return all modules
        res.status(200).json({
          meta: {
            statusCode: 200,
            executionTime: `${end - start}ms`
          },
          data: allModules.map(module => ({
            modules_Id: module.modules_Id,
            modules_name: module.modules_name
          }))
        });
      } catch (error) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1140;
        
        // Log the warning
        logger.logWithMeta("warn", `Error retrieving all modules ${error.message}`, {
          errorCode,
          errorMessage: error.message,
          executionTime,
          statusCode: 500,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
        // logger.error('Error retrieving all modules', { error: error.message, executionTime: `${end - start}ms` });
        res.status(500).json({
          meta: {
            statusCode: 500,
            errorCode: 1140,
            executionTime: `${end - start}ms`
          },
          error: {
            message: 'Error retrieving modules: ' + error.message
          }
        });
      }
    };
    
    exports.updateModule = async (req, res) => {
      const clientIp = await getClientIp(req);
      const start = Date.now();
      const modules_Id = req.params.id; // Correctly extract the module ID from the parameters
      const { modules_name } = req.body;
  
      console.log('Updating Module ID:', modules_Id);
      console.log('Request Body:', req.body);
  
      try {
          const UserModules = require('../models/HospitalModules')(req.sequelize);
          console.log('UserModules Model Loaded:', UserModules);
  
          if (!UserModules) {
              throw new Error('UserModules model is not initialized correctly');
          }
  
          const userModules = await UserModules.findByPk(modules_Id);
  
          console.log('Found User Modules:', userModules);
  
          if (!userModules) {
            const end = Date.now();
            const executionTime = `${end - start}ms`;
            const errorCode = 1141;
            
            // Log the warning
            logger.logWithMeta("warn", `Module with ID ${modules_Id} not found ${error.message}`, {
              errorCode,
              statusCode: 404,
              errorMessage: error.message,
              executionTime,
              hospitalId: req.hospitalId,
              ip: clientIp,
              apiName: req.originalUrl, // API name
              method: req.method,
              userAgent: req.headers['user-agent'],     // HTTP method
            });
              // logger.warn(`Module with ID ${modules_Id} not found, executionTime: ${end - start}ms`);
              return res.status(404).json({
                  meta: {
                      statusCode: 404,
                      errorCode: 1141,
                      executionTime: `${end - start}ms`
                  },
                  error: {
                      message: 'Module not found'
                  }
              });
          }
  
          if (modules_name) userModules.modules_name = modules_name;
  
          await userModules.save();
  
          const end = Date.now();
        const executionTime = `${end - start}ms`;
        // Log the warning
        logger.logWithMeta("warn", `Module with ID ${modules_Id} updated successfully`, {
          executionTime,
          statusCode: 200,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],    // HTTP method
        });
          // logger.info(`Module with ID ${modules_Id} updated successfully, executionTime: ${end - start}ms`);
          res.status(200).json({
              meta: {
                  statusCode: 200,
                  executionTime: `${end - start}ms`
              },
              data: {
                  modules_Id: userModules.modules_Id,
                  modules_name: userModules.modules_name
              }
          });
      } catch (error) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1142;
        
        // Log the warning
        logger.logWithMeta("warn", `Error updating module ${error.message}`, {
          errorCode,
          statusCode: 500,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
          // logger.error('Error updating module', { error: error.message, executionTime: `${end - start}ms` });
          res.status(500).json({
              meta: {
                  statusCode: 500,
                  errorCode: 1142,
                  executionTime: `${end - start}ms`
              },
              error: {
                  message: 'Error updating module: ' + error.message
              }
          });
      }
  };
  
