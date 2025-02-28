const logger = require('../logger');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
// const Group = require("../models/AccLedger"); 
// const tax = require("../models/Tax_Model"); 
const getClientIp = require('../util/clientip');
dotenv.config();
// async function getClientIp(req) {
//   // Get client IP from headers or request
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;

//   // Check if the IP is a local or private network
//   if (clientIp === '' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
//     try {
//       // Fetch the public IP dynamically using ipify if it's local/private
//       const ipResponse = await axios.get('https://api.ipify.org?format=json');
//       clientIp = ipResponse.data.ip;
//     } catch (error) {
//       // Log error if fetching the public IP fails
//       logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1219 });

//       // Fallback to localhost if API call fails
//       clientIp = '127.0.0.1';
//     }
//   }

//   return clientIp;
// }
exports.createTaxDetails = async (req, res) => {
    const errors = validationResult(req);
  const start = Date.now();
  let locationData = { city: 'Unknown' };
  const clientIp = await getClientIp(req);
  const { Tax_IDR, tax_rate, is_active, Ledger_IDR, From_Date, To_Date, Tax_Details_Leble, Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current } = req.body;
  const hospitalDatabase = req.hospitalDatabase;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}

  try {
      // Ensure dynamic initialization of models
      const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      const Group = require("../models/AccLedger")(req.sequelize, Sequelize.DataTypes);
      const Tax = require("../models/Tax_Model")(req.sequelize, Sequelize.DataTypes);

      // Validate Ledger_IDR
      const group = await Group.findOne({ where: { ledger_id: Ledger_IDR } });

       if (!group) {
                  const executionTime = `${Date.now() - start}ms`;
                  const errorCode = 1286;
          
                  logger.logWithMeta("error", "Service not found", {
                      errorCode,
                      executionTime,
                      hospitalName: req.hospitalName,
                      ip: clientIp,
                    city: locationData?.city,
                    country: locationData?.country,
                    regionName: locationData?.regionName,
                    zip: locationData?.zip,
                      apiName: req.originalUrl,
                      method: req.method,
                      userAgent: req.headers["user-agent"],
                  });
          
                  return res.status(400).json({errorCode, message: "Invalid Ledger_IDR, not found in AccLedger table" });
              }


    

      // Validate Tax_IDR
      const taxData = await Tax.findOne({ where: { tax_id: Tax_IDR } });
     

      if (!taxData) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1286;

        logger.logWithMeta("error", "Service not found", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        return res.status(400).json({errorCode, message: "Invalid Tax_IDR, not found in Tax_Model table" });
    }

      // Create Tax Details
      await Tax_Details.sync();
      const tax_details = await Tax_Details.create({
          Tax_IDR, tax_rate, is_active, Ledger_IDR, From_Date, To_Date, Tax_Details_Leble, Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current
      });


       const executionTime = `${Date.now() - start}ms`;
      
              logger.logWithMeta("info", "Tax Details Created  successfully", {
                  executionTime,
                  hospitalName: req.hospitalName,
                  ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                regionName: locationData?.regionName,
                zip: locationData?.zip,
                  ip: clientIp,
                  apiName: req.originalUrl,
                  method: req.method,
                  userAgent: req.headers["user-agent"],
              });

      res.status(200).json({
        
          meta: {
            message: "Tax Details Created  successfully",
              statusCode: 200,
              executionTime: `${Date.now() - start}ms`,
              hospitalDatabase,
          },
         
          data: tax_details,
      });

  } catch (error) {
      res.status(500).json({
          meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
          error: { message: "Error creating Tax: " + error.message },
      });
  }
};

exports.getAllTaxDetails = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;

  try {
      const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
      const taxDetails = await Tax_Details.findAll();

      res.status(200).json({
          meta: {
              message: "Tax Details fetched successfully",
              statusCode: 200,
              executionTime: `${Date.now() - start}ms`,
              hospitalDatabase,
          },
          data: taxDetails,
      });

  } catch (error) {
      res.status(500).json({
          meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
          error: { message: "Error fetching Tax Details: " + error.message },
      });
  }
};


exports.getTaxDetailsById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params; 
  const hospitalDatabase = req.hospitalDatabase;

  try {
      const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
      const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

      if (!taxDetail) {
          return res.status(404).json({ message: "Tax Detail not found" });
      }

      res.status(200).json({
          meta: {
              message: "Tax Detail fetched successfully",
              statusCode: 200,
              executionTime: `${Date.now() - start}ms`,
              hospitalDatabase,
          },
          data: taxDetail,
      });

  } catch (error) {
      res.status(500).json({
          meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
          error: { message: "Error fetching Tax Detail: " + error.message },
      });
  }
};

exports.updateTaxDetails = async (req, res) => {
    const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const hospitalDatabase = req.hospitalDatabase;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}

  try {
      const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
      const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

      if (!taxDetail) {
          return res.status(404).json({ message: "Tax Detail not found" });
      }

      await taxDetail.update(req.body);

      res.status(200).json({
          meta: {
              message: "Tax Detail updated successfully",
              statusCode: 200,
              executionTime: `${Date.now() - start}ms`,
              hospitalDatabase,
          },
          data: taxDetail,
      });

  } catch (error) {
      res.status(500).json({
          meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
          error: { message: "Error updating Tax Detail: " + error.message },
      });
  }
};

exports.deleteTaxDetails = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const hospitalDatabase = req.hospitalDatabase;

  try {
      const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
      const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

      if (!taxDetail) {
          return res.status(404).json({ message: "Tax Detail not found" });
      }

      await taxDetail.destroy();

      res.status(200).json({
          meta: {
              message: "Tax Detail deleted successfully",
              statusCode: 200,
              executionTime: `${Date.now() - start}ms`,
              hospitalDatabase,
          }
      });

  } catch (error) {
      res.status(500).json({
          meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
          error: { message: "Error deleting Tax Detail: " + error.message },
      });
  }
};

