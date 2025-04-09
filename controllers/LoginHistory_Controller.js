const logger = require("../logger");
//const bcrypt=require('bcryptjs');
//const { v4: uuidv4 } = require("uuid");

//const jwt=require('jsonwebtoken');
const dotenv = require("dotenv");
const requestIp=require('request-ip');
const { sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");
dotenv.config();

exports.create_Login_History = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const hospitalDatabase = req.hospitalDatabase;
const{
    user_IDR,
    loginTime,
    IP_Address,
    computerName,
    logoutTime,
    browserName,
    createdBy
}= req.body;
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const LoginHistory = require("../models/LoginHistory_Model")(req.sequelize);
    const User=require("../models/user")(req.sequelize);
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

    
  } catch (error) {
    
  }

}