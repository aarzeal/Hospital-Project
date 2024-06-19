// // const { Module, Submodule, UserRides } = require('../models');
// const { Module } = require('../models/HospitalModules');
// const { Submodule } = require('../models/hospitalsubmodule');
// const { UserRides } = require('../models/hospitalUserRides');
// const logger = require('../logger');

// // Controller for handling POST request to create a user ride
// exports.createUserRide = async (req, res) => {
//   try {
//     const newUserRide = await UserRides.create(req.body);
//     res.json({
//       meta: {
//         status: 'success',
//         errorCode: null,
//         message: 'User ride created successfully'
//       },
//       data: newUserRide
//     });
//   } catch (error) {
//     logger.error('Error during creating user rides:', error.message);
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         errorCode: 944,
//         message: error.message
//       }
//     });
//   }
// };

// // Controller for handling GET request to fetch all user rides
// exports.getAllUserRides = async (req, res) => {
//   try {
//     const userRides = await UserRides.findAll();
//     logger.info('All user rides retrieved successfully');
//     res.json({
//       meta: {
//         status: 'success',
//         errorCode: null,
//         message: 'All user rides retrieved successfully'
//       },
//       data: userRides
//     });
//   } catch (error) {
//     logger.error('Error retrieving user rides:', error.message);
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         errorCode: 945,
//         message: error.message
//       }
//     });
//   }
// };

// // Controller for handling PUT request to update a user ride by ID
// exports.updateUserRide = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [updated] = await UserRides.update(req.body, {
//       where: { id }
//     });
//     if (updated) {
//       const updatedUserRide = await UserRides.findOne({ where: { id } });
//       res.json({
//         meta: {
//           status: 'success',
//           errorCode: null,
//           message: 'User ride updated successfully'
//         },
//         data: updatedUserRide
//       });
//     } else {
//       throw new Error('User ride not found');
//     }
//   } catch (error) {
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         errorCode: 946,
//         message: error.message
//       }
//     });
//   }
// };

// // Controller for fetching submodule names associated with user rides
// exports.fetchSubmoduleNames = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const userRides = await UserRides.findAll({
//       where: { user_id: userId },
//       include: { model: Submodule, attributes: ['name'] }
//     });
//     const submoduleNames = userRides.map(ride => ride.Submodule.name);
//     res.json({
//       meta: {
//         status: 'success',
//         errorCode: null,
//         message: 'Submodule names retrieved successfully'
//       },
//       data: submoduleNames
//     });
//   } catch (error) {
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         errorCode: 947,
//         message: error.message
//       }
//     });
//   }
// };

// exports.fetchModuleAndSubmoduleNames = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const userRides = await UserRides.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: Module,
//           attributes: ['name'],
//           include: {
//             model: Submodule,
//             attributes: ['name']
//           }
//         }
//       ]
//     });

//     const moduleAndSubmoduleNames = userRides.map(ride => ({
//       moduleName: ride.Module.name,
//       submoduleNames: ride.Module.Submodules.map(submodule => submodule.name)
//     }));

//     res.json({
//       meta: {
//         status: 'success',
//         errorCode: null,
//         message: 'Module and submodule names retrieved successfully'
//       },
//       data: moduleAndSubmoduleNames
//     });
//   } catch (error) {
//     logger.error('Error retrieving module and submodule names:', error.message);
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         errorCode: 948,
//         message: error.message
//       }
//     });
//   }
// };


















const express = require('express');
const router = express.Router();

const logger = require('../logger');  // Assuming logger is configured properly in '../logger'

const dotenv = require('dotenv');
dotenv.config();

exports.creatrides = async (req, res) => {
    const {userId,submodule_id, modules_Id } = req.body;
    // const hospitalId = req.hospitalId;
  
    try {
     
     
      const UserRides = require('../models/hospitalUserRides')(req.sequelize);
  
      // Ensure the table exists
      await UserRides.sync();
  
      const userRides = await UserRides.create({ userId,modules_Id,submodule_id  });
      logger.info(`User created successfully with username: ${userId}`);
  
      res.status(201).json({
        meta: {
          statusCode: 200
        },
        data: {
            submodule_id: userRides.submodule_id,
            userId: userRides.userId,
            modules_Id:userRides.modules_Id
        }
      });
    } catch (error) {
      logger.error('Error creating userRides', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 943
        },
        error: {
          message: 'Error creating userRides: ' + error.message
        }
      });
    }
  };
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
//       logger.error('Error retrieving Modules', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 945
//         },
//         error: {
//           message: 'Error retrieving Modules: ' + error.message
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
//             message: 'Module not found'
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
//       logger.error('Error updating user', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 947
//         },
//         error: {
//           message: 'Error updating user: ' + error.message
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
//                 message: 'Module ID is required'
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
//                     message: 'Module not found'
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














