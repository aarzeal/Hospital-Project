//const module= require("../models/masterModule");
const logger=require("../logger");
const bcrypt=require('bcryptjs');
const { v4: uuidv4 } = require("uuid");

const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const requestIp=require('request-ip');
const {sequelize}=require('sequelize');
const Group=require("../models/HospitalGroup");
const {validationResult}=require("express-validator");
const getClientIp=require('../util/clientip');
const getLocationData = require("../util/locationHelper");
dotenv.config();

exports.createRoomType = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const hospitalDatabase = req.hospitalDatabase;
    const {
        roomType_Name,
        roomType_Code,
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
        const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
        const hospital = require("../models/HospitalModel")
        const Service = require("../models/ser")(req.sequelize);
    
        const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
    
        if (!group) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9243;
    
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
            updatedBy: req.username
          });
          return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
        }
    
        await RoomType.sync({ force: false });
    
        const roomType = await RoomType.create({
            roomType_Name,
            roomType_Code,
            isActive,
            hospital_IDR,
            hospitalGroup_IDR,
            updatedBy,
          createdBy: req.username,
          // updatedBy: req.username,
        
        });
    
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "RoomType created successfully", {
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
          data: { roomType },
        });
      } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9245;
    
        logger.logWithMeta("error", "Error creating roomType", {
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
          error: { message: "Error creating roomtype: " + error.message },
        });
      }
    };

    exports.getallroomtype = async (req, res) => {
        const start = Date.now();
        try {
            const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
          const roomtypeRecords = await RoomType.findAll();
      
          const executionTime = `${Date.now() - start}ms`;
          logger.logWithMeta("info", "Fetched RoomType records successfully", {
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
              totalRecords: roomtypeRecords.length,
            },
            data: roomtypeRecords,
          });
        } catch (error) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9246;
      
          logger.logWithMeta("error", "Error fetching RoomType records", {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
          });
      
          res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error fetching RoomType records: " + error.message },
          });
        }
      };

      exports.getRoomTypeById = async (req, res) => {
        //const logId = uuidv4();
        const clientIp = await getClientIp(req);
        const locationData = await getLocationData(clientIp);
    
        try {
            const { roomType_ID } = req.params;
            const RoomType = require("../models/RoomType_Model.js")(req.sequelize);    
            const roomType = await RoomType.findByPk(roomType_ID);
            
            if (!roomType) {
                logger.logWithMeta("warn", "RoomType not found", { 
                    //logId, 
                    errorCode: 9247, 
                    apiName: req.originalUrl, 
                    method: req.method, 
                    clientIp, 
                    locationData,
                    createdBy: req.username,
                    updatedBy:req.username
                });
                return res.status(404).json({ errorCode: 9247, message: "Room Type not found" });
            }
    
            logger.logWithMeta("info", "Room Type fetched successfully", { 
               // logId, 
                apiName: req.originalUrl, 
                method: req.method, 
                clientIp, 
                locationData,
                data: roomType,
                createdBy: req.username,
                updatedBy:req.username
            });
    
            return res.status(200).json({ message: "roomType fetched successfully", data: roomType });
        } catch (error) {
            logger.logWithMeta("error", "Error fetching roomType", { 
                //logId, 
                errorCode: 9248, 
                apiName: req.originalUrl, 
                method: req.method, 
                clientIp, 
                errorMessage: error.message, 
                locationData ,
                createdBy: req.username,
                updatedBy:req.username
            });
    
            return res.status(500).json({ errorCode: 9248, message: "Error fetching roomType", error: error.message });
        }
    };

  

  exports.updateRoomType = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const hospitalDatabase = req.hospitalDatabase;
    const { roomType_Name, roomType_Code, isActive, hospital_IDR, hospitalGroup_IDR, updatedBy,UpdatedAt} = req.body;
  
  
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
      const Hospital = require("../models/HospitalModel");
      const Group = require("../models/HospitalGroup");
      const logger = require("../logger");
      const { roomType_ID } = req.params;
  
      const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
      if (!group) {
        logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", { hospitalGroup_IDR, hospitalDatabase, apiName: req.originalUrl });
        return res.status(400).json({ errorCode: 9243, message: "Invalid HospitalGroupID, not found in MasterDB" });
      }
  
      const hospital = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
      if (!hospital) {
        logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", { hospital_IDR, hospitalDatabase, apiName: req.originalUrl });
        return res.status(400).json({ errorCode: 9244, message: "Invalid HospitalID, not found in MasterDB" });
      }
  
      const roomType = await RoomType.findOne({ where: { roomType_ID } });
      if (!roomType) {
        logger.logWithMeta("error", "RoomType not found", { roomType_ID, hospitalDatabase, apiName: req.originalUrl });
        return res.status(404).json({ errorCode: 9247, message: "RoomType not found" });
      }
  
      await roomType.update({
        roomType_Name,
        roomType_Code,
        isActive,
        hospital_IDR,
        hospitalGroup_IDR,
        updatedBy: req.username,
        UpdatedAt:Date.now()
      });
  
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "Room Type updated successfully", { roomType_ID, hospitalDatabase, executionTime, apiName: req.originalUrl });
  
      res.status(200).json({
        meta: { statusCode: 200, executionTime, hospitalDatabase },
        data: { roomType },
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9249;
  
      logger.logWithMeta("error", "Error updating roomType", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error updating roomType: " + error.message },
      });
    }
  };

  exports.deleteroomTypeById = async (req, res) => {
    const start = Date.now();
    const hospitalDatabase = req.hospitalDatabase;
    const { roomType_ID } = req.params;
    try {
      const RoomType = require("../models/RoomType_Model.js")(req.sequelize);
      const logger = require("../logger");
  
      const roomType = await RoomType.findOne({ where: { roomType_ID } });
      if (!roomType) {
        logger.logWithMeta("error", "roomType not found", { roomType_ID, hospitalDatabase, apiName: req.originalUrl });
        return res.status(404).json({ errorCode: 9247, message: "roomType not found" });
      }
  
      await roomType.destroy();
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "roomType deleted successfully", { roomType_ID, hospitalDatabase, executionTime, apiName: req.originalUrl });
  
      res.status(200).json({
        meta: { statusCode: 200, executionTime, hospitalDatabase },
        message: "roomType deleted successfully",
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9250;
      logger.logWithMeta("error", "Error deleting roomType", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error deleting roomType: " + error.message },
      });
    }
  };
  

