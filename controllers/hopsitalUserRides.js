

// const express = require('express');
// const router = express.Router();

// const logger = require('../logger');  // Assuming logger is configured properly in '../logger'

// const dotenv = require('dotenv');
// dotenv.config();

// exports.creatrides = async (req, res) => {
//     const {userId,submodule_id, modules_Id } = req.body;
//     // const hospitalId = req.hospitalId;
  
//     try {
     
     
//       const UserRides = require('../models/hospitalUserRides')(req.sequelize);
  
//       // Ensure the table exists
//       await UserRides.sync();
  
//       const userRides = await UserRides.create({ userId,modules_Id,submodule_id  });
//       logger.info(`User created successfully with username: ${userId}`);
  
//       res.status(201).json({
//         meta: {
//           statusCode: 200
//         },
//         data: {
//             submodule_id: userRides.submodule_id,
//             userId: userRides.userId,
//             modules_Id:userRides.modules_Id
//         }
//       });
//     } catch (error) {
//       logger.error('Error creating userRides', { error: error.message });
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 943
//         },
//         error: {
//           message: 'Error creating userRides: ' + error.message
//         }
//       });
//     }
//   };
// // exports.getSubModule = async (req, res) => {
// //     const { submodule_id } = req.body;
// //     console.log(submodule_id)
  
// //     try {
// //       const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);

// //       const userSubModules = await UserSubModules.findByPk(submodule_id);
  
// //       if (!userSubModules) {
// //         logger.warn(`submodule with ID ${submodule_id} not found`);
// //         return res.status(404).json({
// //           meta: {
// //             statusCode: 404,
// //             errorCode: 944
// //           },
// //           error: {
// //             message: 'submodule not found'
            
// //           }
// //         });
// //       }
  
// //       logger.info(`submodule with ID ${submodule_id} retrieved successfully`);
      
// //       res.status(200).json({
// //         meta: {
// //           statusCode: 200
// //         },
// //         data: {
// //             submodule_id: userSubModules.submodule_id,
// //             submodule_name: userSubModules.submodule_name,
// //             modules_Id:userSubModules.modules_Id
// //         }
// //       });
// //     } catch (error) {
// //       logger.error('Error retrieving Modules', { error: error.message });
// //       res.status(500).json({
// //         meta: {
// //           statusCode: 500,
// //           errorCode: 945
// //         },
// //         error: {
// //           message: 'Error retrieving Modules: ' + error.message
// //         }
// //       });
// //     }
// //   };
  



// //   exports.updateSubModule = async (req, res) => {
// //     const { submodule_id } = req.body;
// //     const { submodules_name } = req.body;
  
// //     try {
// //       const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
// //       const userSubModules = await UserSubModules.findByPk(submodule_id);
  
// //       if (!userSubModules) {
// //         logger.warn(`User with ID ${submodule_id} not found`);
// //         return res.status(404).json({
// //           meta: {
// //             statusCode: 404,
// //             errorCode: 946
// //           },
// //           error: {
// //             message: 'Module not found'
// //           }
// //         });
// //       }
  
// //       if (submodules_name) userSubModules.submodules_name = submodules_name;
      
  
// //       await userSubModules.save();
  
// //       logger.info(`User with ID ${submodule_id} updated successfully`);
// //       res.status(200).json({
// //         meta: {
// //           statusCode: 200
// //         },
// //         data: {
// //             submodule_id: userSubModules.submodule_id,
// //             submodules_name: userSubModules.submodules_name
// //         }
// //       });
// //     } catch (error) {
// //       logger.error('Error updating user', { error: error.message });
// //       res.status(500).json({
// //         meta: {
// //           statusCode: 500,
// //           errorCode: 947
// //         },
// //         error: {
// //           message: 'Error updating user: ' + error.message
// //         }
// //       });
// //     }
// //   };

// //   exports.getSubModulesByModuleId = async (req, res) => {
// //     const { modules_Id } = req.body;
    

// //     logger.info(`Received request for submodules with module_id: ${modules_Id} `);

// //     if (!modules_Id) {
// //         logger.warn('Module ID is missing in the request');
// //         return res.status(400).json({
// //             meta: {
// //                 statusCode: 400,
// //                 errorCode: 948
// //             },
// //             error: {
// //                 message: 'Module ID is required'
// //             }
// //         });
// //     }

// //     try {
// //         const UserSubModules = require('../models/hospitalsubmodule')(req.sequelize);
// //         const UserModules = require('../models/HospitalModules')(req.sequelize); // Assuming this is the modules model

// //         // Find the module for the given module_id and hospitalId
// //         const module = await UserModules.findOne({ where: { modules_Id } });

// //         if (!module) {
// //             logger.warn(`Module with ID ${modules_Id} `);
// //             return res.status(404).json({
// //                 meta: {
// //                     statusCode: 404,
// //                     errorCode: 949
// //                 },
// //                 error: {
// //                     message: 'Module not found'
// //                 }
// //             });
// //         }

// //         // Find all submodules for the given module_id and hospitalId
// //         const subModules = await UserSubModules.findAll({ where: { modules_Id: modules_Id} });

// //         if (!subModules || subModules.length === 0) {
// //             logger.warn(`Submodules for module ID ${modules_Id} `);
// //             return res.status(404).json({
// //                 meta: {
// //                     statusCode: 404,
// //                     errorCode: 950
// //                 },
// //                 error: {
// //                     message: 'Submodules not found'
// //                 }
// //             });
// //         }

// //         // Format the response
// //         const response = {
// //             modules_Id: module.modules_Id,
// //             modules_name: module.modules_name,
// //             submodules: subModules.map(sub => ({
// //                 submodule_id: sub.submodule_id,
// //                 submodule_name: sub.submodule_name
// //             }))
// //         };

// //         logger.info(`Submodules for module ID ${modules_Id} `);

// //         res.status(200).json({
// //             meta: {
// //                 statusCode: 200
// //             },
// //             data: response
// //         });
// //     } catch (error) {
// //         logger.error('Error retrieving submodules', { error: error.message });
// //         res.status(500).json({
// //             meta: {
// //                 statusCode: 500,
// //                 errorCode: 951
// //             },
// //             error: {
// //                 message: 'Error retrieving submodules: ' + error.message
// //             }
// //         });
// //     }
// // };;



// Ensure these are correctly exported from their respective model files
const {UserModules} = require('../models/HospitalModules');
const {UserSubModules} = require('../models/hospitalsubmodule');
const {UserRides} = require('../models/hospitalUserRides');


// exports.getUserModulesAndSubmodules = async (req, res) => {

//   const { userId } = req;
//   const { UserRides, UserModules, UserSubModules } = req.models;

//   try {
//     const userRides = await UserRides.findAll({
//       where: { userId },
//       include: [
//         {
//           model: UserModules,
//           as: 'module',
//           include: [
//             {
//               model: UserSubModules,
//               as: 'submodules',
//               attributes: ['submodule_name'],
//             },
//           ],
//         },
//       ],
//     });

//     const formattedData = userRides.reduce((acc, ride) => {
//       const module = acc.find((mod) => mod.moduleId === ride.module.modules_Id);
//       if (module) {
//         module.submodules.push(ride.module.submodules);
//       } else {
//         acc.push({
//           moduleId: ride.module.modules_Id,
//           moduleName: ride.module.modules_name,
//           submodules: ride.module.submodules,
//         });
//       }
//       return acc;
//     }, []);

//     res.status(200).json(formattedData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'An error occurred while fetching data' });
//   }
// };
exports.getUserModulesAndSubmodules = async (req, res) => {
  const { userId } = req;
  const { UserRides, UserModules, UserSubModules } = req.models;

  try {
    const userRides = await UserRides.findAll({
      where: { userId },
      include: [
        {
          model: UserModules,
          as: 'module',
          include: [
            {
              model: UserSubModules,
              as: 'submodules',
            },
          ],
        },
      ],
    });

    const formattedData = userRides.reduce((acc, ride) => {
      let module = acc.find((mod) => mod.moduleId === ride.module.modules_Id);

      if (!module) {
        // Create a new module entry if it doesn't exist
        module = {
          moduleId: ride.module.modules_Id,
          moduleName: ride.module.modules_name,
          submodules: []
        };
        acc.push(module);
      }

      // Add submodules to the respective module only if they don't already exist
      ride.module.submodules.forEach((submodule) => {
        if (!module.submodules.some((sub) => sub.submoduleId === submodule.submodule_id)) {
          module.submodules.push({
            submoduleId: submodule.submodule_id,
            submoduleName: submodule.submodule_name,
            url: submodule.url
          });
        }
      });

      return acc;
    }, []);

    res.status(200).json({ modules: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};



// const logger = require('../logger'); // Assuming logger is configured in a file like this

// exports.getUserModulesAndSubmodules = async (req, res) => {
//   const { userId } = req;
//   const { UserRides, UserModules, UserSubModules } = req.models;
  
//   const start = Date.now();

//   try {
//     const userRides = await UserRides.findAll({
//       where: { userId },
//       include: [
//         {
//           model: UserModules,
//           as: 'module',
//           include: [
//             {
//               model: UserSubModules,
//               as: 'submodules',
//               attributes: ['submodule_name'], // Only select the submodule_name attribute
//             },
//           ],
//         },
//       ],
//     });

//     // Transform the data into the desired format
//     const formattedData = userRides.reduce((acc, ride) => {
//       const existingModule = acc.find((mod) => mod.moduleName === ride.module.modules_name);

//       if (existingModule) {
//         // Add unique submodules to the existing module
//         const newSubmodules = ride.module.submodules.map(sub => sub.submodule_name);
//         existingModule.submodules = [...new Set([...existingModule.submodules, ...newSubmodules])];
//       } else {
//         // Create a new module entry with unique submodules
//         acc.push({
//           moduleName: ride.module.modules_name,
//           submodules: [...new Set(ride.module.submodules.map(sub => sub.submodule_name))],
//         });
//       }

//       return acc;
//     }, []);

//     // Format the response to match the desired output
//     const response = formattedData.map(module => ({
//       moduleName: module.moduleName,
//       submodules: module.submodules.join(', ') // Join submodules with a comma
//     }));

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     logger.info('User modules and submodules fetched successfully', { executionTime });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         errorCode: null,
//         executionTime,
//       },
//       data: response
//     });
//   } catch (err) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     logger.error('An error occurred while fetching user modules and submodules', {
//       error: err.message,
//       executionTime,
//     });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 5001,
//         executionTime,
//       },
//       error: {
//         message: 'An error occurred while fetching data',
//       }
//     });
//   }
// };














