


// Ensure these are correctly exported from their respective model files



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

//     // Format the response to JSON
//     const response = Array.from(modulesMap.entries()).map(([moduleName, submodules]) => ({
//       moduleName, // Module name as a key
//       submodules  // Array of submodule names
//     }));

//     // If the user has no rights
//     if (response.length === 0) {
//       return res.status(200).json({
//         meta: {
//           statusCode: 200,
//           message: 'User has no rights'
//         },
//         data: []
//       });
//     }
//     console.log("resp",response)

//     // Send JSON response
//     res.json({
//       meta: {
//         statusCode: 200,
//         message: 'Modules and submodules fetched successfully'
//       },
//       data: response
//     });
//   } 
//   catch (error) {
//         // Handle specific table error
//         if (error.message.includes("Table 'umc54.userrights' doesn't exist")) {
//           return res.status(200).json({
//             meta: {
//               statusCode: 200,
//               message: 'User has no rights'
//             },
//             data: []
//           });
//         }
    
//     console.error('Error fetching modules and submodules:', error);

//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// module.exports = {
//   getModulesAndSubModulesByUserId
// };



const getModulesAndSubModulesByUserId = async (req, res) => {
  console.log("Models available:", Object.keys(req.models || {}));
  try {
    // Ensure `req.models` is available
    if (!req.models) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const { UserModules, UserSubModules, UserRides } = req.models;

    // Ensure models are loaded
    if (!UserModules || !UserSubModules || !UserRides) {
      return res.status(500).json({ message: 'Required models are missing' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch user rights with proper includes
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

    // Handle case where no rights exist
    if (!userRights.length) {
      return res.status(200).json({
        meta: { statusCode: 200, message: 'User has no rights' },
        data: []
      });
    }

    // Group submodules by module
    const modulesMap = new Map();
    userRights.forEach(right => {
      const moduleName = right.module?.modules_name;
      const submoduleName = right.submodule?.submodule_name;

      if (!moduleName || !submoduleName) return;

      if (!modulesMap.has(moduleName)) {
        modulesMap.set(moduleName, []);
      }
      modulesMap.get(moduleName).push(submoduleName);
    });

    // Convert map to array format
    const response = Array.from(modulesMap.entries()).map(([moduleName, submodules]) => ({
      moduleName,
      submodules
    }));

    console.log("Response:", response);

    // Send JSON response
    res.json({
      meta: { statusCode: 200, message: 'Modules and submodules fetched successfully' },
      data: response
    });

  } catch (error) {
    // Handle case where table does not exist
    if (error.message.toLowerCase().includes("doesn't exist")) {
      return res.status(200).json({
        meta: { statusCode: 200, message: 'User has no rights' },
        data: []
      });
    }

    console.error('Error fetching modules and submodules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getModulesAndSubModulesByUserId };
