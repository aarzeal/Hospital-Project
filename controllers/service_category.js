const Module = require("../models/masterModule");
const logger = require('../logger');
const bcrypt = require('bcryptjs');
// Assuming logger is configured properly in '../logger'
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup"); 
dotenv.config();
async function getClientIp(req) {
  // Get client IP from headers or request
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;

  // Check if the IP is a local or private network
  if (clientIp === '' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      // Fetch the public IP dynamically using ipify if it's local/private
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      // Log error if fetching the public IP fails
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1219 });

      // Fallback to localhost if API call fails
      clientIp = '127.0.0.1';
    }
  }

  return clientIp;
}
exports.ensureSequelizeInstance = (req, res, next) => {
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
exports.createServiceCategory = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryname, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);


    const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR} });

    console.log("group0000000000",group)

    if (!group) {
      return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
    }


    const serviceCategory = await ServiceCategory.create({
      servicecategoryname,
        HospitalGroupIDR,
    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Service category created successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
      },
      data: { serviceCategory },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 939;

    logger.logWithMeta("error", "Error creating service category", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating service category: " + error.message },
    });
  }
};
exports.getServiceCategories = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryId } = req.query; // Get the optional ID from query params
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);

    let data;
    if (servicecategoryId) {
      data = await ServiceCategory.findOne({ where: { servicecategoryId } });
      if (!data) {
        return res.status(404).json({ message: "Service category not found" });
      }
    } else {
      data = await ServiceCategory.findAll();
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched service categories successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 940;

    logger.logWithMeta("error", "Error fetching service categories", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching service categories: " + error.message },
    });
  }
};


exports.updateServiceCategory = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryId } = req.params;
  const { servicecategoryname, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);

    let serviceCategory = await ServiceCategory.findOne({ where: { id: servicecategoryId } });
    if (!serviceCategory) {
      return res.status(404).json({ message: "Service category not found" });
    }

    serviceCategory.servicecategoryname = servicecategoryname;
    serviceCategory.HospitalGroupIDR = HospitalGroupIDR;
    await serviceCategory.save();

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Updated service category successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: serviceCategory,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 941;

    logger.logWithMeta("error", "Error updating service category", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating service category: " + error.message },
    });
  }
};
