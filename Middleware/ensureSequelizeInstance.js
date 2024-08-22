const { Sequelize } = require('sequelize');
const logger = require('../logger'); // Adjust the path to your logger
const initializeUserModules = require('../models/HospitalModules');
const initializeUserSubModules = require('../models/hospitalsubmodule');
const initializeUserRides = require('../models/hospitalUserRides');

exports.ensureSequelizeInstance = (req, res, next) => {
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

  // Initialize models with the sequelize instance
  const UserModules = initializeUserModules(sequelize);
  const UserSubModules = initializeUserSubModules(sequelize);
  const UserRides = initializeUserRides(sequelize);

  // Set associations
  UserModules.hasMany(UserSubModules, { as: 'submodules', foreignKey: 'modules_Id' });
  UserRides.belongsTo(UserModules, { as: 'module', foreignKey: 'modules_Id' });

  req.sequelize = sequelize;
  req.models = { UserModules, UserSubModules, UserRides };

  logger.info('Sequelize instance and models initialized successfully');
  next();
};
