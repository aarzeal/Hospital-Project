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

exports.createRoom = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    room_Name,
    roomType_IDR,
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
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const hospital = require("../models/HospitalModel.js");
    const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
    const Service = require("../models/ser")(req.sequelize);

    const roomtypeid = await RoomType.findOne({
      where: { roomType_ID: roomType_IDR },
    });

    if (!roomtypeid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid roomType_ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          roomType_ID: req.roomType_Name,
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
        message: "Invalid roomType_ID, not found in MasterDB",
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

    await Rooms.sync({ force: false });

    const rooms = await Rooms.create({
      room_Name,
      roomType_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy,
      createdBy: req.username,
      // updatedBy: req.username,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Room created successfully", {
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
      data: { rooms },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9245;

    logger.logWithMeta("error", "Error creating room", {
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
      error: { message: "Error creating room: " + error.message },
    });
  }
};

exports.getallrooms = async (req, res) => {
  const start = Date.now();
  try {
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const roomsRecords = await Rooms.findAll();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched Rooms records successfully", {
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
        totalRecords: roomsRecords.length,
      },
      data: roomsRecords,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9246;

    logger.logWithMeta("error", "Error fetching Rooms records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error fetching Rooms records: " + error.message },
    });
  }
};

exports.getRoomsById = async (req, res) => {
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const { room_ID } = req.params;

    // Ensure both Models are loaded correctly with the sequelize instance
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    // const RoomType = require("../models/RoomType_Model.js")(req.sequelize);

    // Fetch the room by primary key (room_ID)
    const rooms = await Rooms.findByPk(room_ID);

    if (!rooms) {
      logger.logWithMeta("warn", "Room not found", {
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
        .json({ errorCode: 9247, message: "Room not found" });
    }

    // Log the rooms object to inspect its structure
    // console.log("Fetched room:", rooms.dataValues.roomType_IDR);

    // Check if roomType_ID exists in the fetched room
    // if (!rooms.dataValues.roomType_IDR) {
    //   logger.logWithMeta("warn", "RoomType_ID is missing in the room", {
    //     errorCode: 9249,
    //     apiName: req.originalUrl,
    //     method: req.method,
    //     clientIp,
    //     locationData,
    //     createdBy: req.username,
    //     updatedBy: req.username,
    //   });
    //   return res
    //     .status(400)
    //     .json({
    //       errorCode: 9249,
    //       message: "RoomType_ID is missing in the room",
    //     });
    // }

    // // Fetch the associated RoomType for the room
    // const roomType = await RoomType.findOne({
    //   where: { roomType_ID: rooms.dataValues.roomType_IDR },
    // });

    // if (!roomType) {
    //   logger.logWithMeta("warn", "RoomType not found for this room", {
    //     errorCode: 9250,
    //     apiName: req.originalUrl,
    //     method: req.method,
    //     clientIp,
    //     locationData,
    //     createdBy: req.username,
    //     updatedBy: req.username,
    //   });
    //   return res
    //     .status(404)
    //     .json({ errorCode: 9250, message: "RoomType not found for this room" });
    // }

    // Log the information of the room and its type
    logger.logWithMeta("info", "Room fetched successfully", {
      apiName: req.originalUrl,
      method: req.method,
      clientIp,
      locationData,
      data: rooms,
      createdBy: req.username,
      updatedBy: req.username,
    });

    // Return the response with room and roomType information
    return res.status(200).json({
      message: "Room fetched successfully",
      data: rooms,
      //roomType: roomType,
    });
  } catch (error) {
    // Log the error
    logger.logWithMeta("error", "Error fetching room", {
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
      message: "Error fetching room",
      error: error.message,
    });
  }
};

exports.updateRoom = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    room_Name,
    roomType_IDR,
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
    const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
    const Hospital = require("../models/HospitalModel");
    const Group = require("../models/HospitalGroup");
    const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
    const logger = require("../logger");
    const { room_ID } = req.params;

    const group = await Group.findOne({
      where: { HospitalGroupID: hospitalGroup_IDR },
    });
    if (!group) {
      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        { hospitalGroup_IDR, hospitalDatabase, apiName: req.originalUrl }
      );
      return res
        .status(400)
        .json({
          errorCode: 9243,
          message: "Invalid HospitalGroupID, not found in MasterDB",
        });
    }
    const roomtypeid = await RoomType.findOne({
      where: { roomType_ID: roomType_IDR },
    });

    if (!roomtypeid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid room_ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          roomType_ID: req.roomType_Name,
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
        message: "Invalid roomType_ID, not found in MasterDB",
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
      return res
        .status(400)
        .json({
          errorCode: 9244,
          message: "Invalid HospitalID, not found in MasterDB",
        });
    }

    const rooms = await Rooms.findOne({ where: { room_ID } });
    if (!rooms) {
      logger.logWithMeta("error", "Room not found", {
        room_ID,
        hospitalDatabase,
        apiName: req.originalUrl,
      });
      return res
        .status(404)
        .json({ errorCode: 9247, message: "Room not found" });
    }

    await rooms.update({
      room_Name,
      roomType_IDR,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy: req.username,
      UpdatedAt: Date.now(),
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Room updated successfully", {
      room_ID,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: { rooms },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating room", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating room: " + error.message },
    });
  }
};

  exports.deleteroomById = async (req, res) => {
    const start = Date.now();
    const hospitalDatabase = req.hospitalDatabase;
    const { room_ID } = req.params;
    try {
     // const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
     const Rooms = require("../models/Rooms_Model.js")(req.sequelize);
      const logger = require("../logger");

      const rooms = await Rooms.findOne({ where: { room_ID } });
      if (!rooms) {
        logger.logWithMeta("error", "room not found", { room_ID, hospitalDatabase, apiName: req.originalUrl });
        return res.status(404).json({ errorCode: 9247, message: "room not found" });
      }

      await rooms.destroy();
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "room deleted successfully", { room_ID, hospitalDatabase, executionTime, apiName: req.originalUrl });

      res.status(200).json({
        meta: { statusCode: 200, executionTime, hospitalDatabase },
        message: "room deleted successfully",
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9250;
      logger.logWithMeta("error", "Error deleting room", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error deleting room: " + error.message },
      });
    }
  };
