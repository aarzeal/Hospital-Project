const { Sequelize } = require('sequelize');
const logger = require('../logger'); // Adjust the path to your logger
const initializeUserModules = require('../models/HospitalModules');
const initializeUserSubModules = require('../models/hospitalsubmodule');
const initializeUserRides = require('../models/hospitalUserRights');

// exports.ensureSequelizeInstance = (req, res, next) => {
//   const start = Date.now();
  
//   if (!req.hospitalDatabase) {
//     const end = Date.now();
//     logger.error('Database connection not established', { executionTime: `${end - start}ms` });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 927,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Database connection not established'
//       }
//     });
//   }

//   const sequelize = new Sequelize(
//     req.hospitalDatabase,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       dialect: process.env.DB_DIALECT
//     }
//   );

//   // Initialize models with the sequelize instance
//   const UserModules = initializeUserModules(sequelize);
//   const UserSubModules = initializeUserSubModules(sequelize);
//   const UserRides = initializeUserRides(sequelize);

//   // Set associations
//   UserModules.hasMany(UserSubModules, { as: 'submodules', foreignKey: 'modules_Id' });
//   UserRides.belongsTo(UserModules, { as: 'module', foreignKey: 'modules_Id' });

//   req.sequelize = sequelize;
//   req.models = { UserModules, UserSubModules, UserRides };

//   logger.info('Sequelize instance and models initialized successfully');
//   next();
// };






// exports.ensureSequelizeInstance = async (req, res, next) => {
//   const start = Date.now();

//   // Check if hospitalDatabase is available
//   if (!req.hospitalDatabase) {
//     const end = Date.now();
//     logger.error('Database connection not established', { executionTime: `${end - start}ms` });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 927,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Database connection not established'
//       }
//     });
//   }

//   try {
//     // Initialize a new Sequelize instance
//     const sequelize = new Sequelize(
//       req.hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT
//       }
//     );

//     // Initialize models with the sequelize instance
//     const UserModules = initializeUserModules(sequelize);
//     const UserSubModules = initializeUserSubModules(sequelize);
//     const UserRides = initializeUserRides(sequelize);

//     // Set associations between models
//     UserModules.hasMany(UserSubModules, { as: 'submodules', foreignKey: 'modules_Id' });
//     UserRides.belongsTo(UserModules, { as: 'module', foreignKey: 'modules_Id' });
//     UserSubModules.belongsTo(UserModules, { foreignKey: 'modules_Id' });

//     // Attach the sequelize instance and models to the request object
//     req.sequelize = sequelize;
//     req.models = {
//       UserModules,
//       UserSubModules,
//       UserRides
//     };

//     logger.info('Sequelize instance and models initialized successfully');
//     next();

//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error initializing Sequelize instance', { error, executionTime: `${end - start}ms` });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Failed to initialize Sequelize instance'
//       }
//     });
//   }
// };


exports.ensureSequelizeInstance = (req, res) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);

  if (!req.hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 937;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Database connection not established`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

    // return res.status(statusCode).json({
    //   meta: {
    //     statusCode: statusCode,
    //     errorCode: 937,
    //     executionTime: `${end - start}ms`,
    //   },

    //   error: {
    //     message: "Database connection not established",
    //   },
    // });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
    }
  );

  req.sequelize = sequelize;
  // logger.info('Sequelize instance created successfully');
  const end = Date.now();
  const executionTime = `${end - start}ms`;
  // Log the warning
  // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
  //   executionTime,
  //   statusCode: 200,
  //   hospitalId: req.hospitalId,
  //   // ip: clientIp,
  //   apiName: req.originalUrl, // API name
  //   method: req.method,
  //   userAgent: req.headers["user-agent"], // HTTP method
  // });
  // next();

  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Database synchronized successfully.");
    })
    .catch((error) => {
      console.error("Error synchronizing the database:", error);
    });
};

