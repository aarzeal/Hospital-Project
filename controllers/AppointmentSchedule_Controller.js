//const module= require("../models/masterModule");
const logger = require("../logger");
//const bcrypt=require('bcryptjs');
//const { v4: uuidv4 } = require("uuid");

//const jwt=require('jsonwebtoken');
const dotenv = require("dotenv");
//const requestIp=require('request-ip');
const { sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");
dotenv.config();

exports.register_Appointment_Schedule = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    Employee_IDR,
    Day,
    Slot1,
    Slot2,
    Slot1_StartTime,
    Slot1_EndTime,
    Slot2_StartTime,
    Slot2_EndTime,
    Duration,
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
    const AppointmentSchedule = require("../models/AppointmentSchedule_Model")(
      req.sequelize
    );
    const hospital = require("../models/HospitalModel");
    const Employee = require("../models/tblEmployee")(req.sequelize);

    const employee = await Employee.findOne({
      where: { EmployeeID: Employee_IDR },
    });

    if (!employee) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta(
        "error",
        "Invalid Employee ID, not found in MasterDB",
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
        message: "Invalid Employee ID, not found in MasterDB",
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

    const existingELementCheck=await AppointmentSchedule.findOne({ where: { Employee_IDR: Employee_IDR, Day:Day } });

    // console.log("existingELementCheck",existingELementCheck);

    if(existingELementCheck){
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9244;

      logger.logWithMeta("error", "Appointment data is already exists", {
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
      return res.status(403).json({
        errorCode,
        message: "Appointment data is already exists",
      });
    }

    await AppointmentSchedule.sync({ force: false });

    const appointmentSchedule = await AppointmentSchedule.create({
      Employee_IDR,
      Day,
      Slot1,
      Slot2,
      Slot1_StartTime,
      Slot1_EndTime,
      Slot2_StartTime,
      Slot2_EndTime,
      Duration,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      createdBy: req.username,
      // updatedBy: req.username,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Appointment Scheduled successfully", {
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
      data: { appointmentSchedule },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9245;

    logger.logWithMeta("error", "Error while Scheduling Appointment", {
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
      error: {
        message: "Error while Scheduling Appointment: " + error.message,
      },
    });
  }
};

    exports.getallAppointmentSchedule = async (req, res) => {
        const start = Date.now();
        try {
            const AppointmentSchedule = require("../models/AppointmentSchedule_Model")(
                req.sequelize
              );
          const AppointmentScheduleRecords = await AppointmentSchedule.findAll();

          const executionTime = `${Date.now() - start}ms`;
          logger.logWithMeta("info", "Fetched Appointment Schedule records successfully", {
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
              totalRecords: AppointmentScheduleRecords.length,
            },
            data: AppointmentScheduleRecords,
          });
        } catch (error) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9246;

          logger.logWithMeta("error", "Error fetching Appointment Schedule records", {
            errorCode,
            executionTime,
            hospitalId: req.hospitalName,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
          });

          res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error fetching Appointment Schedule records: " + error.message },
          });
        }
      };

      exports.getAppointmentScheduleById = async (req, res) => {
        //const logId = uuidv4();
        const clientIp = await getClientIp(req);
        const locationData = await getLocationData(clientIp);

        try {
            const { AppointmentSchedule_Id } = req.params;
            const AppointmentSchedule = require("../models/AppointmentSchedule_Model.js")(req.sequelize);
            const appointmentSchedule = await AppointmentSchedule.findByPk(AppointmentSchedule_Id);

            if (!appointmentSchedule) {
                logger.logWithMeta("warn", "Appointment Schedule not found", {
                    //logId,
                    errorCode: 9247,
                    apiName: req.originalUrl,
                    method: req.method,
                    clientIp,
                    locationData,
                    createdBy: req.username,
                    updatedBy:req.username
                });
                return res.status(404).json({ errorCode: 9247, message: "Appointment Schedule not found" });
            }

            logger.logWithMeta("info", "Appointment Schedule fetched successfully", {
               // logId,
                apiName: req.originalUrl,
                method: req.method,
                clientIp,
                locationData,
                data: appointmentSchedule,
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(200).json({ message: "Appointment Schedule fetched successfully", data: appointmentSchedule });
        } catch (error) {
            logger.logWithMeta("error", "Error fetching Appointment Schedule", {
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

            return res.status(500).json({ errorCode: 9248, message: "Error fetching Appointment Schedule", error: error.message });
        }
    };

  exports.updateappointmentScheduleById = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const hospitalDatabase = req.hospitalDatabase;
    const {
      Employee_IDR,
      Day,
      Slot1,
      Slot2,
      Slot1_StartTime,
      Slot1_EndTime,
      Slot2_StartTime,
      Slot2_EndTime,
      Duration,
      isActive,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy,
      UpdatedAt
    } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const AppointmentSchedule = require("../models/AppointmentSchedule_Model.js")(req.sequelize);
      const Employee=require("../models/tblEmployee.js")(req.sequelize);
      const Hospital = require("../models/HospitalModel");
      const Group = require("../models/HospitalGroup");
      const logger = require("../logger");
      const { AppointmentSchedule_Id } = req.params;

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

      const employee = await Employee.findOne({
        where: { EmployeeID: Employee_IDR },
      });
  
      if (!employee) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9243;
  
        logger.logWithMeta(
          "error",
          "Invalid Employee ID, not found in MasterDB",
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
          message: "Invalid Employee ID, not found in MasterDB",
        });
      }

      const appointmentSchedule = await AppointmentSchedule.findOne({ where: { AppointmentSchedule_Id } });
      if (!appointmentSchedule) {
        logger.logWithMeta("error", "RoomType not found", { AppointmentSchedule_Id, hospitalDatabase, apiName: req.originalUrl });
        return res.status(404).json({ errorCode: 9247, message: "Appointment Schedule not found" });
      }

      await appointmentSchedule.update({
        Employee_IDR,
        Day,
        Slot1,
        Slot2,
        Slot1_StartTime,
        Slot1_EndTime,
        Slot2_StartTime,
        Slot2_EndTime,
        Duration,
        isActive,
        hospital_IDR,
        hospitalGroup_IDR,
        updatedBy: req.username,
        UpdatedAt:Date.now()
      });

      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "Appointment Schedule updated successfully", { AppointmentSchedule_Id, hospitalDatabase, executionTime, apiName: req.originalUrl });

      res.status(200).json({
        meta: { statusCode: 200, executionTime, hospitalDatabase },
        data: { appointmentSchedule },
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9249;

      logger.logWithMeta("error", "Error updating Appointment Schedule", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });

      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error updating Appointment Schedule: " + error.message },
      });
    }
  };

  exports.deleteAppointmentScheduleById = async (req, res) => {
    const start = Date.now();
    const hospitalDatabase = req.hospitalDatabase;
    const { AppointmentSchedule_Id } = req.params;
    try {
      const AppointmentSchedule = require("../models/AppointmentSchedule_Model.js")(req.sequelize);
      const logger = require("../logger");

      const appointmentSchedule = await AppointmentSchedule.findOne({ where: { AppointmentSchedule_Id } });
      if (!appointmentSchedule) {
        logger.logWithMeta("error", "appointment Schedule not found", { AppointmentSchedule_Id, hospitalDatabase, apiName: req.originalUrl });
        return res.status(404).json({ errorCode: 9247, message: "appointment Schedule not found" });
      }

      await appointmentSchedule.destroy();
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "appointment Schedule deleted successfully", { AppointmentSchedule_Id, hospitalDatabase, executionTime, apiName: req.originalUrl });

      res.status(200).json({
        meta: { statusCode: 200, executionTime, hospitalDatabase },
        message: "appointment Schedule deleted successfully",
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9250;
      logger.logWithMeta("error", "Error deleting appointment Schedule", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error deleting appointment Schedule: " + error.message },
      });
    }
  };
