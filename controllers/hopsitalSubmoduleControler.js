
const express = require('express');
const router = express.Router();

const logger = require('../logger');  // Assuming logger is configured properly in '../logger'

const dotenv = require('dotenv');
dotenv.config();
const requestIp = require('request-ip');
async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1135 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}
// exports.creatsubmodules = async (req, res) => {
//     const { submodule_name,modules_Id } = req.body;
//     const hospitalId = req.hospitalId;
  
//     try {
     
     
//       const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
  
//       // Ensure the table exists
//       await UserSubModules.sync();
  
//       const userSubModules = await UserSubModules.create({ submodule_name,modules_Id,hospitalId  });
//       logger.info(`User created successfully with username: ${submodule_name}, hospitalId: ${hospitalId}`);
  
//       res.status(201).json({
//         meta: {
//           statusCode: 200
//         },
//         data: {
//             submodule_id: userSubModules.submodule_id,
//             submodule_name: userSubModules.submodule_name,
//             modules_Id:userSubModules.modules_Id
//         }
//       });
//     } catch (error) {
//       logger.error('Error creating subModules', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 943
//         },
//         error: {
//           message: 'Error creating submodules: ' + error.message
//         }
//       });
//     }
//   };
// exports.getSubModule = async (req, res) => {
//     const { submodule_id } = req.body;
//     console.log(submodule_id)
  
//     try {
//       const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

//       const userSubModules = await UserSubModules.findByPk(submodule_id);
  
//       if (!userSubModules) {
//         logger.warn(`submodule with ID ${submodule_id} not found`);
//         return res.status(404).json({
//           meta: {
//             statusCode: 404,
//             errorCode: 944
//           },
//           error: {
//             message: 'submodule not found'
            
//           }
//         });
//       }
  
//       logger.info(`submodule with ID ${submodule_id} retrieved successfully`);
      
//       res.status(200).json({
//         meta: {
//           statusCode: 200
//         },
//         data: {
//             submodule_id: userSubModules.submodule_id,
//             submodule_name: userSubModules.submodule_name,
//             modules_Id:userSubModules.modules_Id
//         }
//       });
//     } catch (error) {
//       logger.error('Error retrieving subModules', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 945
//         },
//         error: {
//           message: 'Error retrieving subModules: ' + error.message
//         }
//       });
//     }
//   };
  
//   exports.updateSubModule = async (req, res) => {
//     const { submodule_id } = req.body;
//     const { submodules_name } = req.body;
  
//     try {
//       const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
//       const userSubModules = await UserSubModules.findByPk(submodule_id);
  
//       if (!userSubModules) {
//         logger.warn(`User with ID ${submodule_id} not found`);
//         return res.status(404).json({
//           meta: {
//             statusCode: 404,
//             errorCode: 946
//           },
//           error: {
//             message: 'subModule not found'
//           }
//         });
//       }
  
//       if (submodules_name) userSubModules.submodules_name = submodules_name;
      
  
//       await userSubModules.save();
  
//       logger.info(`User with ID ${submodule_id} updated successfully`);
//       res.status(200).json({
//         meta: {
//           statusCode: 200
//         },
//         data: {
//             submodule_id: userSubModules.submodule_id,
//             submodules_name: userSubModules.submodules_name
//         }
//       });
//     } catch (error) {
//       logger.error('Error updating submodules', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 947
//         },
//         error: {
//           message: 'Error updating submodule: ' + error.message
//         }
//       });
//     }
//   };

//   exports.getSubModulesByModuleId = async (req, res) => {
//     const { modules_Id } = req.body;
    

//     logger.info(`Received request for submodules with module_id: ${modules_Id} `);

//     if (!modules_Id) {
//         logger.warn('Module ID is missing in the request');
//         return res.status(400).json({
//             meta: {
//                 statusCode: 400,
//                 errorCode: 948
//             },
//             error: {
//                 message: 'subModule ID is required'
//             }
//         });
//     }

//     try {
//         const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
//         const UserModules = require('../models/HospitalModules')(req.sequelize); // Assuming this is the modules model

//         // Find the module for the given module_id and hospitalId
//         const module = await UserModules.findOne({ where: { modules_Id } });

//         if (!module) {
//             logger.warn(`Module with ID ${modules_Id} `);
//             return res.status(404).json({
//                 meta: {
//                     statusCode: 404,
//                     errorCode: 949
//                 },
//                 error: {
//                     message: 'subModule not found'
//                 }
//             });
//         }

//         // Find all submodules for the given module_id and hospitalId
//         const subModules = await UserSubModules.findAll({ where: { modules_Id: modules_Id} });

//         if (!subModules || subModules.length === 0) {
//             logger.warn(`Submodules for module ID ${modules_Id} `);
//             return res.status(404).json({
//                 meta: {
//                     statusCode: 404,
//                     errorCode: 950
//                 },
//                 error: {
//                     message: 'Submodules not found'
//                 }
//             });
//         }

//         // Format the response
//         const response = {
//             modules_Id: module.modules_Id,
//             modules_name: module.modules_name,
//             submodules: subModules.map(sub => ({
//                 submodule_id: sub.submodule_id,
//                 submodule_name: sub.submodule_name
//             }))
//         };

//         logger.info(`Submodules for module ID ${modules_Id} `);

//         res.status(200).json({
//             meta: {
//                 statusCode: 200
//             },
//             data: response
//         });
//     } catch (error) {
//         logger.error('Error retrieving submodules', { error: error.message });
//         res.status(500).json({
//             meta: {
//                 statusCode: 500,
//                 errorCode: 951
//             },
//             error: {
//                 message: 'Error retrieving submodules: ' + error.message
//             }
//         });
//     }
// };;




exports.createSubmodules = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { submodule_name, modules_Id } = req.body;
  const hospitalId = req.hospitalId;

  try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

      // Ensure the table exists
      await UserSubModules.sync();

      const userSubModules = await UserSubModules.create({ submodule_name, modules_Id, hospitalId });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `Submodule created successfully with name: ${submodule_name}`, {
        executionTime,
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
    logger.logWithMeta("warn", `Error creating submodules ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
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

  const { submodule_id } = req.body;

  console.log(submodule_id)

  try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
      const userSubModules = await UserSubModules.findByPk(submodule_id);

      if (!userSubModules) {
        const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1145;
    
    // Log the warning
    logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
        //   logger.warn(`Submodule with ID ${submodule_id} not found, executionTime: ${end - start}ms`);
          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 1145,
                  executionTime: `${end - start}ms`
              },
              error: {
                  message: 'Submodule not found'
              }
          });
      }

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `Submodule with ID ${submodule_id} retrieved successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Submodule with ID ${submodule_id} retrieved successfully, executionTime: ${end - start}ms`);

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
    const errorCode = 1146;
    
    // Log the warning
    logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    //   logger.error('Error retrieving submodules', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 1146,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Error retrieving submodules: ' + error.message
          }
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
          logger.logWithMeta("warn", `No submodules found ${error.message}`, {
            errorCode,
            errorMessage: error.message,
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
      logger.logWithMeta("warn", `Error retrieving all submodules ${error.message}`, {
        errorCode,
        errorMessage: error.message,
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

    const submodule_id = req.params.id;

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
        logger.logWithMeta("warn", `Submodule with ID ${submodule_id} not found ${error.message}`, {
          errorCode,
          errorMessage: error.message,
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
      logger.logWithMeta("warn", `Error updating submodule ${error.message}`, {
        errorCode,
        errorMessage: error.message,
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
  
  
exports.getSubModulesByModuleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { modules_Id } = req.body;

  logger.info(`Received request for submodules with module_id: ${modules_Id}`);

  if (!modules_Id) {
    const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1151;
      
      // Log the warning
      logger.logWithMeta("warn", `Module ID is missing in the request ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    //   logger.warn('Module ID is missing in the request, executionTime: ${end - start}ms,{errorCode:errorCode}');
      return res.status(400).json({
          meta: {
              statusCode: 400,
              errorCode: errorCode,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Module ID is required'
          }
      });
  }

  try {
      const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
      const UserModules = require('../models/HospitalModules')(req.sequelize); // Assuming this is the modules model

      // Find the module for the given module_id and hospitalId
      const module = await UserModules.findOne({ where: { modules_Id } });

      if (!module) {
        const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1152;
      
      // Log the warning
      logger.logWithMeta("warn", `Module with ID ${modules_Id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
        //   logger.warn(`Module with ID ${modules_Id} not found, executionTime: ${end - start}ms`);
          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 1152,
                  executionTime: `${end - start}ms`
              },
              error: {
                  message: 'Module not found'
              }
          });
      }

      // Find all submodules for the given module_id and hospitalId
      const subModules = await UserSubModules.findAll({ where: { modules_Id } });

      if (!subModules || subModules.length === 0) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1153;
        
        // Log the warning
        logger.logWithMeta("warn", `Submodules for module ID ${modules_Id} not found ${error.message}`, {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
        //   logger.warn(`Submodules for module ID ${modules_Id} not found, executionTime: ${end - start}ms`);
          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 1153,
                  executionTime: `${end - start}ms`
              },
              error: {
                  message: 'Submodules not found'
              }
          });
      }

      // Format the response
      const response = {
          modules_Id: module.modules_Id,
          modules_name: module.modules_name,
          submodules: subModules.map(sub => ({
              submodule_id: sub.submodule_id,
              submodule_name: sub.submodule_name
          }))
      };

    
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta("warn", `Submodules for module ID ${modules_Id} retrieved successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Submodules for module ID ${modules_Id} retrieved successfully, executionTime: ${end - start}ms`);

      res.status(200).json({
          meta: {
              statusCode: 200,
              executionTime: `${end - start}ms`
          },
          data: response
      });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1154;
    
    // Log the warning
    logger.logWithMeta("warn", `Error retrieving submodules ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    //   logger.error('Error retrieving submodules', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 1154,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Error retrieving submodules: ' + error.message
          }
      });
  }
}