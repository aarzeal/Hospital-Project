const { Sequelize } = require('sequelize');
const logger = require('../logger'); // Adjust the path to your logger
const ensureSequelizeInstance = (req, res, next) => {
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

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 937,
        executionTime: `${end - start}ms`,
      },

      error: {
        message: "Database connection not established",
      },
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: false,
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
  next();

  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Database synchronized successfully.");
    })
    .catch((error) => {
      console.error("Error synchronizing the database:", error);
    });
};
module.exports = ensureSequelizeInstance;