// ensureSequelizeInstance.js

const { Sequelize } = require('sequelize');
const logger = require('../logger'); // Adjust path as per your project structure

module.exports = (req, res, next) => {
  const start = Date.now();
  
  // Assuming req.hospitalDatabase holds the database name
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

  // Create Sequelize instance dynamically
  const sequelize = new Sequelize(
    req.hospitalDatabase, // Database name from req
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      define: {
        // Define your global options here
      },
      logging: false // Disable logging if not needed
    }
  );

  req.sequelize = sequelize;
  logger.info('Sequelize instance created successfully');
  next();
};
