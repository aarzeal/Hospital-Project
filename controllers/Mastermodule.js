
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
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1219 });

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
// exports.getModules = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const moduleId = req.params.id;

//   try {
//     const Module = require("../models/masterModule")(req.sequelize);
//     let result;

//     if (moduleId) {
//       result = await Module.findByPk(moduleId);
//       if (!result) {
//         logger.logWithMeta("warn", `Module not found`, {
//           errorCode: 1220,
//           executionTime: `${Date.now() - start}ms`,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           statusCode: 404,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//         });

//         return res.status(404).json({
//           meta: {
//             statusCode: 404,
//             errorCode: 1220,
//             executionTime: `${Date.now() - start}ms`,
//           },
//           error: {
//             message: "Module not found",
//           },
//         });
//       }
//     } else {
//       result = await Module.findAll();
//     }

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", `Modules fetched successfully`, {
//       executionTime,
//       statusCode: 200,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//       },
//       data: result,
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1221;

//     logger.logWithMeta("error", `Error fetching modules: ${error.message}`, {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       statusCode: 500,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode,
//         executionTime,
//       },
//       error: {
//         message: "Database error",
//       },
//     });
//   }
// };

exports.ensureSequelizeInstance = (req, res, next) => {
  const start = Date.now();

  const hospitalDatabase = req.headers["hospitaldatabase"]; // Fetch from headers (case-sensitive)

  if (!hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1222;
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
        meta: { statusCode: 500, errorCode: 1223, executionTime: `${Date.now() - start}ms` },
        error: { message: "Failed to connect to database" },
      });
    });
};
exports.creatmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { modules_name, status } = req.body; // Can be a single string or an array of names

  try {
    const UserModules = require("../models/HospitalModules")(req.sequelize);

    // Ensure the table exists
    await UserModules.sync();

    let createdModules;

    if (Array.isArray(modules_name)) {
      // If multiple module names are provided, insert in bulk
      const modulesData = modules_name.map(name => ({
        modules_name: name,
        status: status || "true"
      }));
      createdModules = await UserModules.bulkCreate(modulesData);
    } else {
      // If a single module name is provided
      createdModules = await UserModules.create({
        modules_name,
        status: status || "true", // Default status
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Logging
    logger.logWithMeta("warn", `Modules created successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: Array.isArray(createdModules)
        ? createdModules.map(module => ({
          modules_Id: module.modules_Id,
          modules_name: module.modules_name,
          status: module.status,
        }))
        : {
          modules_Id: createdModules.modules_Id,
          modules_name: createdModules.modules_name,
          status: createdModules.status,
        },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1224;

    // Error Logging
    logger.logWithMeta("warn", `Error creating modules`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: "Error creating modules: " + error.message,
      },
    });
  }
};

exports.getModule = async (req, res) => {

  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { modules_Id } = req.query; // Retrieve from query parameters

  console.log("modules_Id", JSON.stringify(modules_Id));

  try {
    if (!modules_Id) {
      return res.status(400).json({
        meta: { statusCode: 400, errorCode: 1225, executionTime: `${Date.now() - start}ms` },
        error: { message: "modules_Id is required in query parameters" },
      });
    }

    const UserModules = require("../models/HospitalModules")(req.sequelize);
    const userModules = await UserModules.findByPk(modules_Id);

    if (!userModules) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1226;

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
        status: userModules.status,
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1227;

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
      const errorCode = 1228;

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
          errorCode: 1228,
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
        modules_name: module.modules_name,
        status: module.status,
      }))
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1229;

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
        errorCode: 1229,
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
  const { modules_Id } = req.query; // Extract module ID from query parameters
  const { modules_name, status } = req.body; // Get modules_name and status from req body

  if (!modules_Id) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1230,
        executionTime: `${Date.now() - start}ms`
      },
      error: {
        message: 'Module ID is required'
      }
    });
  }

  try {
    const UserModules = require('../models/HospitalModules')(req.sequelize);

    if (!UserModules) {
      throw new Error('UserModules model is not initialized correctly');
    }

    const userModules = await UserModules.findByPk(modules_Id);

    if (!userModules) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1231;

      logger.logWithMeta("warn", `Module with ID ${modules_Id} not found`, {
        errorCode,
        statusCode: 404,
        executionTime,
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
          executionTime
        },
        error: {
          message: 'Module not found'
        }
      });
    }

    // ✅ Update name if provided
    if (modules_name) userModules.modules_name = modules_name;

    if (typeof status === "boolean") {
      userModules.status = status;
    } 
    await userModules.save();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", `Module with ID ${modules_Id} updated successfully`, {
      statusCode: 200,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime
      },
      data: {
        modules_Id: userModules.modules_Id,
        modules_name: userModules.modules_name,
        status: userModules.status,
      }
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1232;

    logger.logWithMeta("error", `Error updating module: ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime
      },
      error: {
        message: `Error updating module: ${error.message}`
      }
    });
  }
};
