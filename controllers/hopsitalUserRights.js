

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
const {UserRides} = require('../models/hospitalUserRights');



  // const getModulesAndSubModulesByUserId = async (req, res) => {
  //   try {
  //     const userId = req.user.userId; // Extract userId from the token payload
  
  //     if (!userId) {
  //       return res.status(400).json({ message: 'User ID is required' });
  //     }
  
  //     const { UserModules, UserSubModules, UserRides } = req.models;
  
  //     const userRights = await UserRides.findAll({
  //       where: { userId },
  //       include: [
  //         {
  //           model: UserModules,
  //           as: 'module',
  //           attributes: ['modules_name']
  //         },
  //         {
  //           model: UserSubModules,
  //           as: 'submodule',
  //           attributes: ['submodule_name']
  //         }
  //       ]
  //     });
  
  //     // Group submodules by module
  //     const modulesMap = new Map();
  //     userRights.forEach(right => {
  //       const moduleName = right.module.modules_name;
  //       const submoduleName = right.submodule.submodule_name;
  
  //       if (!modulesMap.has(moduleName)) {
  //         modulesMap.set(moduleName, []);
  //       }
  //       modulesMap.get(moduleName).push(submoduleName);
  //     });
  
  //     // Format the response
  //     const response = Array.from(modulesMap.entries()).map(([moduleName, submodules]) => ({
  //       moduleName: `${moduleName} { ${submodules.join(', ')} }`
  //     }));
  
  //     res.json(response);
  //   } catch (error) {
  //     console.error('Error fetching modules and submodules:', error);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // };
  
  // module.exports = {
  //   getModulesAndSubModulesByUserId
  // };
  
  
    ////without query end



  // exports.getUserModulesAndSubmodulesbyusingthereuserId = async (req, res) => {
  //   // Ensure `userId` is extracted correctly and is a number or string
  //   // const userId = parseInt(req.params.userId, 10); // Adjust as needed depending on how userId is passed
  //   const userId = req.user.userId;
  
  //   if (isNaN(userId)) {
  //     return res.status(400).json({ error: 'Invalid userId' });
  //   }
  
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
  //             },
  //           ],
  //         },
  //       ],
  //     });
  
  //     console.log('UserRides:', JSON.stringify(userRides, null, 2)); // Debugging output
  
  //     const formattedData = userRides.reduce((acc, ride) => {
  //       let module = acc.find((mod) => mod.moduleId === ride.module.modules_Id);
  
  //       if (!module) {
  //         module = {

  //           moduleId: ride.module.modules_Id,
  //           moduleName: ride.module.modules_name,
  //           submodules: []

  //         };
  //         acc.push(module);
  //       }
  
  //       ride.module.submodules.forEach((submodule) => {

  //         if (!module.submodules.some((sub) => sub.submoduleId === submodule.submodule_id)) {

  //           module.submodules.push({

  //             submoduleId: submodule.submodule_id,
  //             submoduleName: submodule.submodule_name,
  //             url: submodule.url
  //           });
  //         }
  //       });
  
  //       return acc;
  //     }, []);
  
  //     res.status(200).json({ userId,modules: formattedData });
  //   } catch (err) {
  //     console.error('Error:', err); // Detailed error logging
  //     res.status(500).json({ error: 'An error occurred while fetching data' });
  //   }
  // };

  ///////start  sql quert 
  
  // const { QueryTypes } = require('sequelize');

  // exports.getUserModulesAndSubmodulesByUserId = async (req, res) => {
  //   const userId = req.user.userId; // or req.params.userId depending on how userId is passed
  
  //   // Validate userId
  //   if (isNaN(userId)) {
  //     return res.status(400).json({ error: 'Invalid userId' });
  //   }
  
  //   // SQL query to fetch modules, submodules, and their names
  //   const sqlQuery = `
  //     SELECT 
  //       ur.userId, 
  //       um.modules_Id AS module_id, 
  //       um.modules_name AS module_name, 
  //       us.submodule_id, 
  //       us.submodule_name AS submodule_name
  //     FROM 
  //       UserRights ur
  //     LEFT JOIN 
  //       UserModules um ON ur.modules_Id = um.modules_Id
  //     LEFT JOIN 
  //       UserSubModules us ON ur.submodule_id = us.submodule_id
  //     WHERE 
  //       ur.userId = :userId
  //   `;
  
  //   try {
  //     // Execute the raw SQL query
  //     const userRights = await req.sequelize.query(sqlQuery, {
  //       replacements: { userId },
  //       type: QueryTypes.SELECT
  //     });
  
  //     // Process and format the results
  //     const formattedData = userRights.reduce((acc, item) => {
  //       let module = acc.find((mod) => mod.moduleId === item.module_id);
  
  //       if (!module) {
  //         module = {
  //           moduleId: item.module_id,
  //           moduleName: item.module_name,
  //           submodules: []
  //         };
  //         acc.push(module);
  //       }
  
  //       if (item.submodule_id) {
  //         module.submodules.push({
  //           submoduleId: item.submodule_id,
  //           submoduleName: item.submodule_name
  //         });
  //       }
  
  //       return acc;
  //     }, []);
  
  //     // Respond with the formatted data
  //     res.status(200).json({ userId, modules: formattedData });
  //   } catch (err) {
  //     console.error('Error:', err); // Detailed error logging
  //     res.status(500).json({ error: 'An error occurred while fetching data' });
  //   }
  // };
  
//////////end sql query










const getModulesAndSubModulesByUserId = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the token payload

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const { UserModules, UserSubModules, UserRides } = req.models;

    const userRights = await UserRides.findAll({
      where: { userId },
      include: [
        {
          model: UserModules,
          as: 'module',
          attributes: ['modules_name']
        },
        {
          model: UserSubModules,
          as: 'submodule',
          attributes: ['submodule_name']
        }
      ]
    });

    // Group submodules by module
    const modulesMap = new Map();
    userRights.forEach(right => {
      const moduleName = right.module.modules_name;
      const submoduleName = right.submodule.submodule_name;

      if (!modulesMap.has(moduleName)) {
        modulesMap.set(moduleName, []);
      }
      modulesMap.get(moduleName).push(submoduleName);
    });

    // Format the response to JSON
    const response = Array.from(modulesMap.entries()).map(([moduleName, submodules]) => ({
      moduleName, // Module name as a key
      submodules  // Array of submodule names
    }));

    // Send JSON response
    res.json({
      meta: {
        statusCode: 200,
        message: 'Modules and submodules fetched successfully'
      },
      data: response
    });
  } catch (error) {
    console.error('Error fetching modules and submodules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getModulesAndSubModulesByUserId
};
