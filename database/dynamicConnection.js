
// const { Sequelize } = require('sequelize');

// const { Sequelize } = require('sequelize');
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



const { Sequelize } = require('sequelize');

// Export a function that initializes Sequelize and sets up associations
module.exports = (req, res, next) => {
  const start = Date.now();

  if (!req.hospitalDatabase) {
    const end = Date.now();
    logger.error('Database connection not established', { executionTime: `${end - start}ms` });
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 927,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Database connection not established'
      }
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT
    }
  );

  // Set up models and associations
  setupModelsAndAssociations(sequelize);

  req.sequelize = sequelize;
  logger.info('Sequelize instance created successfully');
  next();
};

function setupModelsAndAssociations(sequelize) {
  // Define models here
  const HospitalGroup = sequelize.define('tblHospitalGroup', {
    // Define your attributes for tblHospitalGroup
  });

  const Hospital = sequelize.define('tblHospital', {
    // Define your attributes for tblHospital
  });

  const Department = sequelize.define('tblDepartment', {
    // Define your attributes for tblDepartment
  });

  // Example of setting associations programmatically
  Hospital.belongsTo(HospitalGroup, {
    foreignKey: 'HospitalGroupIDR',
    targetKey: 'HospitalGroupID',
    constraints: false // Disable constraints to allow cross-database references
  });

  Department.belongsTo(Hospital);
  Hospital.hasMany(Department);
}
