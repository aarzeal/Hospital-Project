const logger = require("../logger");
const os= require('os');
//const bcrypt=require('bcryptjs');
//const { v4: uuidv4 } = require("uuid");

//const jwt=require('jsonwebtoken');
const dotenv = require("dotenv");
//const requestIp = require("request-ip");
//const { sequelize } = require("sequelize");
//const Group = require("../models/HospitalGroup");
const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");
dotenv.config();

exports.create_Login_History = async (req, res) => {
  const IPAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ComputerName = os.hostname();
    const LogoutTime = new Date();
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const {
    user_IDR,
    loginTime,
    IP_Address,
    computerName,
    logoutTime,
    browserName,
    //createdBy,
  } = req.body;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const LoginHistory = require("../models/LoginHistory_Model")(req.sequelize);
    const User = require("../models/user")(req.sequelize);
    const user = await User.findOne({
      where: { userId: user_IDR },
    });

    if (!user) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta("error", "Invalid User ID, not found in MasterDB", {
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
      return res.status(400).json({
        errorCode,
        message: "Invalid User ID, not found in MasterDB",
      });
    }

    await LoginHistory.sync({ force: false });

    const loginHistory = await LoginHistory.create({
      user_IDR,
      loginTime,
      IP_Address:IPAddress,
      computerName:ComputerName,
      logoutTime:LogoutTime,
      browserName:req.body.BrowserName || 'Unknown',
    });
    const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Login History Fetched successfully", {
          executionTime,
         // hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          IP_Address: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
         //createdBy: req.username,
          // updatedBy: req.username,
        });
    
        res.status(200).json({
          meta: {
            statusCode: 200,
            executionTime,
            hospitalDatabase,
          },
          data: { loginHistory },
        });
      } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9245;
    
        logger.logWithMeta("error", "Error while Fetching Login History ", {
          errorCode,
          executionTime,
          //hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          //createdBy: req.username,
          // updatedBy: req.username,
        });
    
        res.status(500).json({
          meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
          error: {
            message: "Error while Fetching Login History: " + error.message,
          },
        });
      }
    };
