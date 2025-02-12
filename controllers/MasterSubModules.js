const submodule = require("../models/MasterSubmodule");
const Module = require("../models/masterModule");
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
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1233 });

      // Fallback to localhost if API call fails
      clientIp = '127.0.0.1';
    }
  }

  return clientIp;
}
exports.getSubmodulesByModuleId = async (req, res) => {
  const start = Date.now();
    const clientIp = req.ip;
  try {
    const { moduleId } = req.params;

    if (!moduleId) {
      logger.logWithMeta("warn", "Module ID is required", {
        errorCode: 1252,
        statusCode: 400,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"]
    });
    return res.status(400).json({
      meta: {
          statusCode: 400,
          errorCode: 1252,
          executionTime: `${Date.now() - start}ms`
      },
      error: { message: "Module ID is required!" }
  });
    }

   
    const Submodule = require("../models/MasterSubmodule");

    const submodules = await Submodule.findAll({
      where: { module_id: moduleId },
      attributes: ["submodule_id", "submodule_name","module_id"],
    });

    if (!submodules || submodules.length === 0) {
      logger.logWithMeta("warn", "No submodules found for the given Module ID", {
        errorCode: 1253,
        statusCode: 404,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"]
    });
    return res.status(404).json({
      meta: {
          statusCode: 404,
          errorCode: 1253,
          executionTime: `${Date.now() - start}ms`
      },
      error: { message: "No submodules found for the given Module ID" }
  });
    }

    logger.logWithMeta("info", "Submodules retrieved successfully", {
      executionTime: `${Date.now() - start}ms`,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"]
  });

    return res.status(200).json({ success: true, data: submodules });

  }catch (error) {
    logger.logWithMeta("error", `Error fetching submodules: ${error.message}`, {
        errorCode: 1254,
        statusCode: 500,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"]
    });

    return res.status(500).json({
        meta: {
            statusCode: 500,
            errorCode: 1254,
            executionTime: `${Date.now() - start}ms`
        },
        error: { message: "Internal server error" }
    });
} 
}; 

// exports.getSubModules = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const submoduleId = req.params.id;

//   try {
//     const SubModule = require("../models/MasterSubmodule")(req.sequelize);
//     let result;

//     if (submoduleId) {
//       result = await SubModule.findByPk(submoduleId);
//       if (!result) {
//         logger.logWithMeta("warn", `SubModule not found`, {
//           errorCode: 1234,
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
//             errorCode: 1234,
//             executionTime: `${Date.now() - start}ms`,
//           },
//           error: {
//             message: "SubModule not found",
//           },
//         });
//       }
//     } else {
//       result = await SubModule.findAll();
//     }

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", `SubModules fetched successfully`, {
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
//     const errorCode = 1235;

//     logger.logWithMeta("error", `Error fetching SubModules: ${error.message}`, {
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

exports.getSubModules = async (req, res) => {
  try {
    const submodules = await submodule.findAll({
      include: [
        {
          model: Module,
          as: "Module",
          attributes: ["module_name"],
        },
      ],
      attributes: ["submodule_id", "submodule_name"],
    });

    if (!submodules.length) {
      return res.status(404).json({ success: false, message: "No submodules found" });
    }

    // Group submodules by module name
    const groupedSubmodules = {};
    submodules.forEach((submodule) => {
      const moduleName = submodule.Module.module_name;
      if (!groupedSubmodules[moduleName]) {
        groupedSubmodules[moduleName] = [];
      }
      groupedSubmodules[moduleName].push({
        submodule_id: submodule.submodule_id,
        submodule_name: submodule.submodule_name,
      });
    });

    res.status(200).json({ success: true, data: groupedSubmodules });
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
    const errorCode = 1236;
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
        meta: { statusCode: 500, errorCode: 1237, executionTime: `${Date.now() - start}ms` },
        error: { message: "Failed to connect to database" },
      });
    });
};

exports.createSubmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { submodule_names, modules_Id, status } = req.body; // Expecting an array of submodule names

  if (!Array.isArray(submodule_names) || submodule_names.length === 0) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1238,
        executionTime: `${Date.now() - start}ms`,
      },
      error: {
        message: "submodule_names must be a non-empty array",
      },
    });
  }

  if (!modules_Id || isNaN(modules_Id)) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1239,
        executionTime: `${Date.now() - start}ms`,
      },
      error: {
        message: "Valid modules_Id is required",
      },
    });
  }

  try {
    const UserSubModules = require("../models/hospitalsubmodule")(req.sequelize);

    await UserSubModules.sync({ alter: true }); 

    // Prepare bulk insert data
    const submodulesData = submodule_names.map((name) => ({
      submodule_name: name,
      modules_Id,
      status: status !== undefined ? status : true, // Default status to true if not provided
    }));

    // Bulk create submodules
    const createdSubmodules = await UserSubModules.bulkCreate(submodulesData);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", `Submodules created successfully`, {
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
      data: createdSubmodules.map((submodule) => ({
        submodule_id: submodule.submodule_id,
        submodule_name: submodule.submodule_name,
        modules_Id: submodule.modules_Id,
        status: submodule.status,
      })),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1240;

    logger.logWithMeta("error", `Error creating submodules: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      statusCode: 500,
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
        message: `Error creating submodules: ${error.message}`,
      },
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
      const errorCode = 1241;

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
        status: userSubModules.status,
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1242;

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
          const errorCode = 1243;
          
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
                    errorCode: 1243,
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
                modules_Id: submodule.modules_Id,
                status: submodule.status,
            }))
        });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1244;
      
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
                errorCode: 1244,
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
  
  const { submodule_name, status } = req.body;
  const { submodule_id } = req.query; // Consider changing this to req.params for consistency

  if (!submodule_id || isNaN(submodule_id)) {
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1245,
        executionTime: `${Date.now() - start}ms`,
      },
      error: {
        message: "Valid submodule_id is required",
      },
    });
  }

  try {
    const UserSubModules = require("../models/hospitalsubmodule")(req.sequelize);
    const userSubModule = await UserSubModules.findByPk(submodule_id);

    if (!userSubModule) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1246;

      logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found`, {
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
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: "Submodule not found",
        },
      });
    }

    // Update fields if provided
    if (submodule_name) userSubModule.submodule_name = submodule_name;
    if (status !== undefined) userSubModule.status = status; // Allow updating status

    await userSubModule.save();

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", `Submodule with ID ${submodule_id} updated successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      statusCode: 200,
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
      data: {
        submodule_id: userSubModule.submodule_id,
        submodule_name: userSubModule.submodule_name,
        status: userSubModule.status,
      },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1247;

    logger.logWithMeta("error", `Error updating submodule: ${error.message}`, {
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
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: `Error updating submodule: ${error.message}`,
      },
    });
  }
};

exports.getAllModulesWithSubModules = async (req, res) => {
  const start = Date.now();
  const clientIp = req.ip;

  try {
      const UserModules = require('../models/hospitalsubmodule')(req.sequelize);
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

      // Ensure Sequelize associations are set
      UserModules.hasMany(UserSubModules, { foreignKey: 'modules_Id', as: 'submodules' });
      UserSubModules.belongsTo(UserModules, { foreignKey: 'modules_Id', as: 'module' });

      // Fetch all modules with submodules
      const modulesWithSubmodules = await UserModules.findAll({
          include: [
              {
                  model: UserSubModules,
                  as: 'submodules',
                  attributes: ['submodule_id', 'submodule_name', 'modules_Id']
              }
          ],
          attributes: ['modules_id', 'modules_name']
      });

      if (!modulesWithSubmodules || modulesWithSubmodules.length === 0) {
          const executionTime = `${Date.now() - start}ms`;

          logger.logWithMeta("warn", "No modules or submodules found", {
              statusCode: 404,
              executionTime,
              hospitalId: req.hospitalId,
              ip: clientIp,
              apiName: req.originalUrl,
              method: req.method,
              userAgent: req.headers['user-agent']
          });

          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 1147,
                  executionTime
              },
              error: {
                  message: "No modules or submodules found"
              }
          });
      }

      // Transforming the response structure
      const formattedData = modulesWithSubmodules.map(module => ({
          modules_id: module.modules_id,
          modules_name: module.modules_name,
          submodules: module.submodules.length > 0
              ? module.submodules.map(submodule => ({
                  submodule_id: submodule.submodule_id,
                  submodule_name: submodule.submodule_name
              }))
              : []
      })).filter(module => module.submodules.length > 0); // Remove modules with no submodules

      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "Modules and submodules retrieved successfully", {
          executionTime,
          statusCode: 200,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent']
      });

      res.status(200).json({
          meta: {
              statusCode: 200,
              executionTime
          },
          data: formattedData
      });

  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("error", `Error retrieving modules and submodules: ${error.message}`, {
          errorCode: 1148,
          statusCode: 500,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent']
      });

      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 1148,
              executionTime
          },
          error: {
              message: `Error retrieving modules and submodules: ${error.message}`
          }
      });
  }
};

// exports.createModulesWithSubmodules = async (req, res) => {
//   try {
//     const modulesData = req.body;

//     if (!Array.isArray(modulesData) || modulesData.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid input data!" });
//     }

//     const sequelize = req.sequelize;
//     if (!sequelize) {
//       return res.status(500).json({ success: false, message: "Database instance not found!" });
//     }

//     const Module = require("../models/masterModule")(sequelize);
//     const Submodule = require("../models/MasterSubmodule")(sequelize);
    
    // await Module.sync({ alter: true }); 
    // await Submodule.sync({ alter: true }); 


//     const transaction = await sequelize.transaction();

//     try {
//       const createdModules = [];

//       for (const moduleData of modulesData) {
//         const { modules_name, status = true, submodules } = moduleData;

//         if (!modules_name || !Array.isArray(submodules) || submodules.length === 0) {
//           throw new Error("Invalid module data! Each module must have a name and at least one submodule.");
//         }

//         // ✅ Create module
//         const module = await Module.create({ modules_name: modules_name, status }, { transaction });

//         // ✅ Create submodules
//         const submoduleData = submodules.map(sub => ({
//           submodule_name: sub.submodule_name,
//           modules_Id: module.modules_Id,
//           status: sub.status ?? true, // ✅ Default true if not provided
//         }));

//         const createdSubmodules = await Submodule.bulkCreate(submoduleData, { transaction });

//         createdModules.push({
//           modules_Id: module.modules_Id,
//           modules_name: module.modules_name,
//           status: module.status,
//           submodules: createdSubmodules.map(sub => ({
//             submodule_id: sub.submodule_id,
//             submodule_name: sub.submodule_name,
//             status: sub.status,
//           })),
//         });
//       }

//       await transaction.commit();

//       return res.status(200).json({
//         success: true,
//         message: "Modules and submodules added successfully!",
//         data: createdModules,
//       });

//     } catch (error) {
//       await transaction.rollback();
//       console.error("❌ Error adding modules and submodules:", error);
//       return res.status(500).json({ success: false, message: "Failed to create modules and submodules" });
//     }
//   } catch (error) {
//     console.error("❌ Internal server error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };


exports.createModulesWithSubmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = req.ip;

  try {
    const modulesData = req.body;
   
    if (!Array.isArray(modulesData) || modulesData.length === 0) {
      logger.logWithMeta("warn", "Invalid input data", {
        statusCode: 400,
        errorCode: 1248,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      return res.status(400).json({
        meta: { statusCode: 400, errorCode: 1248, executionTime: `${Date.now() - start}ms` },
        error: { message: "Invalid input data!" },
      });
    }

    const sequelize = req.sequelize;
    if (!sequelize) {
      logger.logWithMeta("error", "Database instance not found", {
        statusCode: 500,
        errorCode: 1249,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      return res.status(500).json({
        meta: { statusCode: 500, errorCode: 1249, executionTime: `${Date.now() - start}ms` },
        error: { message: "Database instance not found!" },
      });
        }

    const Module = require("../models/HospitalModules")(sequelize);
    const Submodule = require("../models/hospitalsubmodule")(sequelize);
    await Module.sync({ alter: true }); 
    await Submodule.sync({ alter: true });

    const transaction = await sequelize.transaction();

    try {
      const createdModules = [];

      for (const moduleData of modulesData) {
        const { modules_name, status = true, submodules } = moduleData;

        if (!modules_name || !Array.isArray(submodules) || submodules.length === 0) {
          throw new Error("Invalid module data! Each module must have a name and at least one submodule.");
        }

        // ✅ Create module
        const module = await Module.create({ modules_name: modules_name, status }, { transaction });

        // ✅ Create submodules
        const submoduleData = submodules.map(sub => ({
          submodule_name: sub.submodule_name,
          modules_Id: module.modules_Id,
          status: sub.status ?? true, // ✅ Default true if not provided
        }));

        const createdSubmodules = await Submodule.bulkCreate(submoduleData, { transaction });

        createdModules.push({
          modules_Id: module.modules_Id,
          modules_name: module.modules_name,
          status: module.status,
          submodules: createdSubmodules.map(sub => ({
            submodule_id: sub.submodule_id,
            submodule_name: sub.submodule_name,
            status: sub.status,
          })),
        });
      }

      await transaction.commit();

      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "Modules and submodules added successfully", {
        statusCode: 200,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(200).json({
        success: true,
        message: "Modules and submodules added successfully!",
        data: createdModules,
      });

    } catch (error) {
      await transaction.rollback();

      logger.logWithMeta("error", `Failed to create modules and submodules: ${error.message}`, {
        statusCode: 500,
        errorCode: 1250,
        executionTime: `${Date.now() - start}ms`,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(500).json({
        meta: { statusCode: 500, errorCode: 1250, executionTime: `${Date.now() - start}ms` },
        error: { message: "Failed to create modules and submodules" },
      });
    }
  } catch (error) {
    logger.logWithMeta("error", `Internal server error: ${error.message}`, {
      statusCode: 500,
      errorCode: 1251,
      executionTime: `${Date.now() - start}ms`,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode: 1251, executionTime: `${Date.now() - start}ms` },
      error: { message: "Internal server error" },
    });
  }
};
