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




exports.createWard = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    wardName,
    wardTypeIDR,
    serviceIDR,
    floorIDR,
    bedCapacity,
    bedCapacityperRoom,
    isActive,
    checkinTime,
    isNUrChargeApplication,
    hospital_IDR,
    hospitalGroup_IDR,
    createdBy,
    updatedBy,
    Non_Active,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const Ward = require("../models/WardModel")(req.sequelize);
    const hospital = require("../models/HospitalModel")
    const Service = require("../models/ser")(req.sequelize);

    const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });

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
        // updatedBy:req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }
    const hospitalid = await hospital.findOne({ where: { HospitalID: hospital_IDR } });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
    }
    const serviceID = await Service.findOne({ where: { service_id: serviceIDR } });

    if (!serviceID) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid serviceIDR, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid serviceIDR, not found in MasterDB" });
    }


    await Ward.sync({ force: false });

    const ward = await Ward.create({
      wardName,
      wardTypeIDR,
      serviceIDR,
      floorIDR,
      bedCapacity,
      bedCapacityperRoom,
      isActive,
      checkinTime,
      isNUrChargeApplication,
      hospital_IDR,
      hospitalGroup_IDR,
      createdBy: req.username,
      // updatedBy: req.username,
      Non_Active,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      // updatedBy: req.username,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { ward },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error creating ward", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      // updatedBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating ward: " + error.message },
    });
  }
};

exports.getward = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { ward_ID } = req.query;
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const ward = require("../models/WardModel")(req.sequelize);

    let data;
    if (ward_ID) {
      data = await ward.findOne({ where: { ward_ID } });
      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1262;

        logger.logWithMeta("error", "ward not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username
        });

        return res.status(404).json({ errorCode, message: "ward not found" });
      }
    } else {
      data = await ward.findAll();
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched wards successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
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
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching service categories", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching ward: " + error.message },
    });
  }
};


exports.getWardById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { ward_ID } = req.params;
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const Ward = require("../models/WardModel")(req.sequelize);
    const ward = await Ward.findOne({ where: { ward_ID } });

    if (!ward) {

      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "ward not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });

      return res.status(404).json({ errorCode: 1263, message: "Ward not found" });
    }


    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched wards successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });
    res.status(200).json({

      meta: {
        statusCode: 200,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      data: { ward },
    });
  } catch (error) {

    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching ward", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1264, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
      error: { message: "Error fetching ward: " + error.message },
    });
  }
};

exports.updateWard = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { wardID, wardName, wardTypeIDR, serviceIDR, floorIDR, bedCapacity, bedCapacityperRoom, isActive, checkinTime, isNUrChargeApplication, hospital_IDR, hospitalGroup_IDR, updatedBy, Non_Active } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const Ward = require("../models/WardModel")(req.sequelize);
    const Hospital = require("../models/HospitalModel");
    const Service = require("../models/ser")(req.sequelize);
    const Group = require("../models/HospitalGroup");
    const logger = require("../logger");

    const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
    if (!group) {
      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", { hospitalGroup_IDR, hospitalDatabase, apiName: req.originalUrl });
      return res.status(400).json({ errorCode: 1260, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    const hospital = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
    if (!hospital) {
      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", { hospital_IDR, hospitalDatabase, apiName: req.originalUrl });
      return res.status(400).json({ errorCode: 1260, message: "Invalid HospitalID, not found in MasterDB" });
    }

    const service = await Service.findOne({ where: { service_id: serviceIDR } });
    if (!service) {
      logger.logWithMeta("error", "Invalid serviceIDR, not found in MasterDB", { serviceIDR, hospitalDatabase, apiName: req.originalUrl });
      return res.status(400).json({ errorCode: 1260, message: "Invalid serviceIDR, not found in MasterDB" });
    }

    const ward = await Ward.findOne({ where: { wardID } });
    if (!ward) {
      logger.logWithMeta("error", "Ward not found", { wardID, hospitalDatabase, apiName: req.originalUrl });
      return res.status(404).json({ errorCode: 1261, message: "Ward not found" });
    }

    await ward.update({
      wardName,
      wardTypeIDR,
      serviceIDR,
      floorIDR,
      bedCapacity,
      bedCapacityperRoom,
      isActive,
      checkinTime,
      isNUrChargeApplication,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy: req.username,
      Non_Active,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward updated successfully", { wardID, hospitalDatabase, executionTime, apiName: req.originalUrl });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: { ward },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error updating ward", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating ward: " + error.message },
    });
  }
};



exports.deleteWard = async (req, res) => {
  const start = Date.now();
  const hospitalDatabase = req.hospitalDatabase;
  const { wardID } = req.params;
  try {
    const Ward = require("../models/WardModel")(req.sequelize);
    const logger = require("../utils/logger");

    const ward = await Ward.findOne({ where: { wardID } });
    if (!ward) {
      logger.logWithMeta("error", "Ward not found", { wardID, hospitalDatabase, apiName: req.originalUrl });
      return res.status(404).json({ errorCode: 1261, message: "Ward not found" });
    }

    await ward.destroy();
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward deleted successfully", { wardID, hospitalDatabase, executionTime, apiName: req.originalUrl });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Ward deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;
    logger.logWithMeta("error", "Error deleting ward", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error deleting ward: " + error.message },
    });
  }
};
