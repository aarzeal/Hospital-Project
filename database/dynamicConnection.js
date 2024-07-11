
// const { Sequelize } = require('sequelize');

const { Sequelize } = require('sequelize');
require('dotenv').config();


// const createDynamicConnection = (HospitalDatabase) => {
// //     if (!HospitalDatabase) {
// //         throw new Error('Database name not provided...............');
// //       }
    
//     const sequelize = new Sequelize(
//         "umc9",
//         // HospitalDatabase,
//         process.env.DB_USER,
//         process.env.DB_PASSWORD,
//         {
//             host: process.env.DB_HOST,
//             dialect: process.env.DB_DIALECT
//         }
//     );

//     const testConnection = async () => {
//         try {
//             await sequelize.authenticate();
//             console.log(databaseName);
//             console.log('Connection to the database has been established successfully.');
//         } catch (error) {
//             console.error('Unable to connect to the database:', error);
//         }
//     };

//     // return sequelize;
//     return { sequelize, testConnection };
     
// };

// module.exports = createDynamicConnection;



// exports.ensureSequelizeInstance = (req, res, next) => {
//     const start = Date.now();
//     if (!req.hospitalDatabase) {
     
//       const end = Date.now();
//       logger.error('Database connection not established', { executionTime: `${end - start}ms` });
      
//       return res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 927,
//           executionTime: `${end - start}ms`
//         },
        
//         error: {
          
//           message: 'Database connection not established'
//         }
//       });
//     }
  
//     const sequelize = new Sequelize(
//       req.hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT
//       }
//     );
  
//     req.sequelize = sequelize;
//     logger.info('Sequelize instance created successfully');
//     next();
//   };
//   const { sequelize } = require('sequelize');
//   const Hospital = require('../models/HospitalModel');
// const Department = require('../models/DepartmentModel');
// const Designation = require('../models/designation'); // Assuming you have this model

// // Associating models if required
// Hospital.associate({ Department, Designation });
// Department.associate({ Hospital });
// Designation.associate({ Hospital });

// sequelize.sync({ force: true }) // Use force: true to recreate the table if it exists
//   .then(() => {
//     console.log('Database & tables created!');
//   })
//   .catch((error) => {
//     console.error('Error syncing database:', error);
//   });