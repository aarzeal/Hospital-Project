//const module= require("../models/masterModule");
const logger=require("../logger");
const bcrypt=require('bcryptjs');

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
          const errorCode = 1259;
    
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
        const errorCode = 1262;
    
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

    exports.getroomtype = async (req, res) => {
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
          const errorCode = 1263;
      
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

    
  

