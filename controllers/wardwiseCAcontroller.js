const Module = require("../models/masterModule");
const logger = require('../logger');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup"); 
const { validationResult } = require('express-validator');
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper"); 
dotenv.config();


exports.createWwca = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    WwcatypeIDR,
    typeEnum,
    typeIDR,
    costAddRate,
    fromdate,
    todate,
    isActive,
    isCurrectRate,
    hospital_IDR,
    hospitalGroup_IDR,
    createdBy,
    updatedBy,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
    const HospitalGroup = require("../models/HospitalGroup")(req.sequelize);
    const Hospital = require("../models/HospitalModel")(req.sequelize);

    const group = await HospitalGroup.findOne({ where: { hospitalGroup_IDR } });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    const hospital = await Hospital.findOne({ where: { hospital_IDR } });
    if (!hospital) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
    }

    await Wwca.sync({ force: false });

    const wwca = await Wwca.create({
      WwcatypeIDR,
      typeEnum,
      typeIDR,
      costAddRate,
      fromdate,
      todate,
      isActive,
      isCurrectRate,
      hospital_IDR,
      hospitalGroup_IDR,
      createdBy: req.username,
      updatedBy: req.username,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Wwca record created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { wwca },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error creating Wwca record", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating Wwca record: " + error.message },
    });
  }
};
