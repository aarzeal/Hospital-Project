//const module= require("../models/masterModule");
const logger = require("../logger");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const requestIp = require("request-ip");
const { sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");
dotenv.config();

exports.createWardRoomLink = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    ward_IDR,
    room_IDR,
    isActive,
    hospital_IDR,
    hospitalGroup_IDR,
    createdBy,
    updatedBy,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const WardRoomLink = require("../models/LinkWardRoom_Model.js")(
      req.sequelize
    );
    const hospital = require("../models/HospitalModel.js");
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const Ward = require("../models/WardModel")(req.sequelize);
    const Service = require("../models/ser")(req.sequelize);

    const room = await Rooms.findOne({
      where: { room_ID: room_IDR },
    });

    if (!room) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid room_ID, not found in MasterDB", {
        errorCode,
        executionTime,
        room_ID: req.room_Name,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        // updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid room_ID, not found in MasterDB",
      });
    }

    const ward = await Ward.findOne({ where: { ward_ID: ward_IDR } });
    if (!ward) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid ward_ID, not found in MasterDB", {
        errorCode,
        executionTime,
        ward_ID: req.wardName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        // updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid ward_ID, not found in MasterDB",
      });
    }

    const group = await Group.findOne({
      where: { HospitalGroupID: hospitalGroup_IDR },
    });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        {
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
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const hospitalid = await hospital.findOne({
      where: { HospitalID: hospital_IDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9244;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
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
        updatedBy: req.username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    await WardRoomLink.sync({ force: false });

    const wardRoomLink = await WardRoomLink.create({
      ward_IDR,
      room_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy,
      createdBy: req.username,
      // updatedBy: req.username,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "WardRoomLink created successfully", {
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
      data: { wardRoomLink },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9245;

    logger.logWithMeta("error", "Error creating WardRoomLink", {
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
      error: { message: "Error creating WardRoomLink: " + error.message },
    });
  }
};

exports.getallwardroomlink = async (req, res) => {
  const start = Date.now();
  try {
    const WardRoomLink = require("../models/LinkWardRoom_Model.js")(
      req.sequelize
    );
    const wardRoomLinkRecords = await WardRoomLink.findAll();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched WardRoomLink records successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        totalRecords: wardRoomLinkRecords.length,
      },
      data: wardRoomLinkRecords,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9246;

    logger.logWithMeta("error", "Error fetching WardRoomLink records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: {
        message: "Error fetching WardRoomLink records: " + error.message,
      },
    });
  }
};

exports.getWardRoomLinkById = async (req, res) => {
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const { wardRoomLink_ID } = req.params;
      // Ensure both Models are loaded correctly with the sequelize instance
    const WardRoomLink = require("../models/LinkWardRoom_Model.js")(
      req.sequelize
    );
       // Fetch the room by primary key (room_ID)
    const wardRoomLink = await WardRoomLink.findByPk(wardRoomLink_ID);

    if (!wardRoomLink) {
      logger.logWithMeta("warn", "wardRoomLink not found", {
        errorCode: 9247,
        apiName: req.originalUrl,
        method: req.method,
        clientIp,
        locationData,
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "wardRoomLink not found" });
    }

    // Log the information of the room and its type
    logger.logWithMeta("info", "wardRoomLink fetched successfully", {
      apiName: req.originalUrl,
      method: req.method,
      clientIp,
      locationData,
      data: wardRoomLink,
      createdBy: req.username,
      updatedBy: req.username,
    });

    // Return the response with room and roomType information
    return res.status(200).json({
      message: "wardRoomLink fetched successfully",
      data: wardRoomLink,
      //roomType: roomType,
    });
  } catch (error) {
    // Log the error
    logger.logWithMeta("error", "Error fetching wardRoomLink", {
      errorCode: 9248,
      apiName: req.originalUrl,
      method: req.method,
      clientIp,
      errorMessage: error.message,
      locationData,
      createdBy: req.username,
      updatedBy: req.username,
    });

    // Return the error response
    return res.status(500).json({
      errorCode: 9248,
      message: "Error fetching wardRoomLink",
      error: error.message,
    });
  }
};

exports.updateWardRoomLink = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    ward_IDR,
    room_IDR,
    isActive,
    hospital_IDR,
    hospitalGroup_IDR,
    updatedBy,
    UpdatedAt,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const Hospital = require("../models/HospitalModel");
    const Group = require("../models/HospitalGroup");
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const Ward = require("../models/WardModel")(req.sequelize);
    const WardRoomLink = require("../models/LinkWardRoom_Model.js")(req.sequelize);
    const logger = require("../logger");
    const { wardRoomLink_ID } = req.params;

    const group = await Group.findOne({
      where: { HospitalGroupID: hospitalGroup_IDR },
    });
    if (!group) {
      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        { hospitalGroup_IDR, hospitalDatabase, apiName: req.originalUrl }
      );
      return res.status(400).json({
        errorCode: 9243,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const roomid = await Rooms.findOne({
      where: { room_ID: room_IDR },
    });

    if (!roomid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid room_ID, not found in MasterDB", {
        errorCode,
        executionTime,
        room_ID: req.room_Name,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        // updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid room_ID, not found in MasterDB",
      });
    }

    const wardid = await Ward.findOne({
      where: { ward_ID: ward_IDR },
    });

    if (!wardid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid ward_ID, not found in MasterDB", {
        errorCode,
        executionTime,
        ward_ID: req.wardName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        // updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid ward_ID, not found in MasterDB",
      });
    }

    const hospital = await Hospital.findOne({
      where: { HospitalID: hospital_IDR },
    });
    if (!hospital) {
      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        hospital_IDR,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res.status(400).json({
        errorCode: 9244,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    const wardRoomLink = await WardRoomLink.findByPk(wardRoomLink_ID);
    if (!wardRoomLink) {
      logger.logWithMeta("error", "wardRoomLink not found", {
        wardRoomLink_ID,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "wardRoomLink not found" });
    }

    await wardRoomLink.update({
      ward_IDR,
      room_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy: req.username,
      UpdatedAt: Date.now(),
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "wardRoomLink updated successfully", {
      wardRoomLink_ID,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: { wardRoomLink },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;
                
    logger.logWithMeta("error", "Error updating wardRoomLink", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating wardRoomLink: " + error.message },
    });
  }
};

exports.deleteWardRoomLinkById = async (req, res) => {
  const start = Date.now();
  const hospitalDatabase = req.hospitalDatabase;
  const { wardRoomLink_ID } = req.params;
  try {
    // const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
    //const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const WardRoomLink = require("../models/LinkWardRoom_Model.js")(req.sequelize);

    const logger = require("../logger");

    const wardRoomLink = await WardRoomLink.findByPk(wardRoomLink_ID);
    if (!wardRoomLink) {
      logger.logWithMeta("error", "Ward Room Link not found", {
        wardRoomLink_ID,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "Ward Room Link not found" });
    }

    await wardRoomLink.destroy();
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward Room Link deleted successfully", {
    wardRoomLink_ID,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Ward Room Link deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;
    logger.logWithMeta("error", "Error deleting Ward Room Link", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error deleting Ward Room Link: " + error.message },
    });
  }
};
