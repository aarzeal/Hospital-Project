const logger = require('../logger');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require("uuid");
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
// const Group = require("../models/AccLedger"); 
// const tax = require("../models/Tax_Model"); 
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper"); 
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
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();
    const hospitalDatabase = req.hospitalDatabase;

    const { 
        Tax_IDR, tax_rate, is_active, Ledger_IDR, 
        From_Date, To_Date, Tax_Details_Leble, 
        Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current 
    } = req.body;

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9101; // Validation error

        logger.logWithMeta("error", "Validation error in createTaxDetails", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
        });

        return res.status(400).json({ 
            message: "Validation failed", 
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }

    try {
        // Ensure dynamic initialization of models
        const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
        const AccLedger = require("../models/AccLedger")(req.sequelize, Sequelize.DataTypes);
        const Tax = require("../models/Tax_Model")(req.sequelize, Sequelize.DataTypes);


        await Tax_Details.sync({ force: false });
        // Validate Ledger_IDR
        const ledger = await AccLedger.findOne({ where: { ledger_id: Ledger_IDR } });

        if (!ledger) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9102; // Ledger not found

            logger.logWithMeta("error", "Invalid Ledger_IDR, not found in AccLedger table", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(400).json({ 
                errorCode, 
                message: "Invalid Ledger_IDR, not found in AccLedger table" 
            });
        }

        // Validate Tax_IDR
        const tax = await Tax.findOne({ where: { tax_id: Tax_IDR } });

        if (!tax) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9103; // Tax ID not found

            logger.logWithMeta("error", "Invalid Tax_IDR, not found in Tax_Model table", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(400).json({ 
                errorCode, 
                message: "Invalid Tax_IDR, not found in Tax_Model table" 
            });
        }

        // Create Tax Details
        // await Tax_Details.sync();
        const taxDetails = await Tax_Details.create({
            Tax_IDR, tax_rate, is_active, Ledger_IDR, 
            From_Date, To_Date, Tax_Details_Leble, 
            Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Details Created Successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: {
                message: "Tax Details Created Successfully",
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: taxDetails,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9104; // Error creating tax details

        logger.logWithMeta("error", "Error creating Tax Details", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating Tax Details: " + error.message },
        });
    }
};
// exports.createTaxDetails = async (req, res) => {
//     const errors = validationResult(req);
//   const start = Date.now();
  
 
//   const { Tax_IDR, tax_rate, is_active, Ledger_IDR, From_Date, To_Date, Tax_Details_Leble, Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current } = req.body;
//   const hospitalDatabase = req.hospitalDatabase;
//   const clientIp = await getClientIp(req);
//   console.log("Client IP:", clientIp);
//   const logId = uuidv4();

//   // let locationData = { city: "Unknown" };
  

//   if (!errors.isEmpty()) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9000; // Define a specific error code for validation errors

//       logger.logWithMeta("error", "Validation error in createGroup", {
//           errorCode,
//           executionTime,
//           hospitalName: req.hospitalName || "Unknown",
//           ip: clientIp,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//           validationErrors: errors.array(),
//       });

//       return res.status(400).json({ 
//           message: "Validation failed", 
//           errors: errors.array() 
//       });
//   }
//   const locationData = await getLocationData(clientIp);


//   try {
//       // Ensure dynamic initialization of models
//       const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
//       const Group = require("../models/AccLedger")(req.sequelize, Sequelize.DataTypes);
//       const Tax = require("../models/Tax_Model")(req.sequelize, Sequelize.DataTypes);

//       // Validate Ledger_IDR
//       const group = await Group.findOne({ where: { ledger_id: Ledger_IDR } });

//        if (!group) {
//                   const executionTime = `${Date.now() - start}ms`;
//                   const errorCode = 1286;
          
//                   logger.logWithMeta("error", "Service not found", {
//                       errorCode,
//                       executionTime,
//                       hospitalName: req.hospitalName,
//                       ip: clientIp,
//                     city: locationData?.city,
//                     country: locationData?.country,
//                     regionName: locationData?.regionName,
//                     zip: locationData?.zip,
//                       apiName: req.originalUrl,
//                       method: req.method,
//                       userAgent: req.headers["user-agent"],
//                   });
          
//                   return res.status(400).json({errorCode, message: "Invalid Ledger_IDR, not found in AccLedger table" });
//               }


    

//       // Validate Tax_IDR
//       const taxData = await Tax.findOne({ where: { tax_id: Tax_IDR } });
     

//       if (!taxData) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 1286;

//         logger.logWithMeta("error", "Service not found", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           regionName: locationData?.regionName,
//           zip: locationData?.zip,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//         });

//         return res.status(400).json({errorCode, message: "Invalid Tax_IDR, not found in Tax_Model table" });
//     }

//       // Create Tax Details
//       await Tax_Details.sync();
//       const tax_details = await Tax_Details.create({
//           Tax_IDR, tax_rate, is_active, Ledger_IDR, From_Date, To_Date, Tax_Details_Leble, Serial_Number, Is_Primary_Tax, Calculate_On, Is_Current
//       });


//        const executionTime = `${Date.now() - start}ms`;
      
//               logger.logWithMeta("info", "Tax Details Created  successfully", {
//                   executionTime,
//                   hospitalName: req.hospitalName,
//                   ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 regionName: locationData?.regionName,
//                 zip: locationData?.zip,
//                   ip: clientIp,
//                   apiName: req.originalUrl,
//                   method: req.method,
//                   userAgent: req.headers["user-agent"],
//               });

//       res.status(200).json({
        
//           meta: {
//             message: "Tax Details Created  successfully",
//               statusCode: 200,
//               executionTime: `${Date.now() - start}ms`,
//               hospitalDatabase,
//           },
         
//           data: tax_details,
//       });

//   } catch (error) {
//       res.status(500).json({
//           meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
//           error: { message: "Error creating Tax: " + error.message },
//       });
//   }
// };

exports.getAllTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    try {
        const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
        
        const taxDetails = await Tax_Details.findAll();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Details fetched successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: {
                message: "Tax Details fetched successfully",
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: taxDetails,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9105; // Error fetching tax details

        logger.logWithMeta("error", "Error fetching Tax Details", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error fetching Tax Details: " + error.message },
        });
    }
};

// exports.getAllTaxDetails = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//       const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
//       const taxDetails = await Tax_Details.findAll();

//       res.status(200).json({
//           meta: {
//               message: "Tax Details fetched successfully",
//               statusCode: 200,
//               executionTime: `${Date.now() - start}ms`,
//               hospitalDatabase,
//           },
//           data: taxDetails,
//       });

//   } catch (error) {
//       res.status(500).json({
//           meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
//           error: { message: "Error fetching Tax Details: " + error.message },
//       });
//   }
// };


exports.getTaxDetailsById = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    try {
        const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
        
        const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

        if (!taxDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9106; // Tax detail not found error

            logger.logWithMeta("error", "Tax Detail not found", {
                errorCode,
                executionTime,
                logId,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(404).json({
                meta: { statusCode: 404, errorCode, executionTime, hospitalDatabase },
                error: { message: "Tax Detail not found" },
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Detail fetched successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: {
                message: "Tax Detail fetched successfully",
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: taxDetail,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9107; // Error fetching tax detail

        logger.logWithMeta("error", "Error fetching Tax Detail", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error fetching Tax Detail: " + error.message },
        });
    }
};

// exports.getTaxDetailsById = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const { id } = req.params; 
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//       const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
//       const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

//       if (!taxDetail) {
//           return res.status(404).json({ message: "Tax Detail not found" });
//       }

//       res.status(200).json({
//           meta: {
//               message: "Tax Detail fetched successfully",
//               statusCode: 200,
//               executionTime: `${Date.now() - start}ms`,
//               hospitalDatabase,
//           },
//           data: taxDetail,
//       });

//   } catch (error) {
//       res.status(500).json({
//           meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
//           error: { message: "Error fetching Tax Detail: " + error.message },
//       });
//   }
// };

exports.updateTaxDetails = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9108; // Validation error

        logger.logWithMeta("error", "Validation error in updateTaxDetails", {
            errorCode,
            executionTime,
            logId,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
        });

        return res.status(400).json({
            meta: { statusCode: 400, errorCode, executionTime, hospitalDatabase },
            error: { message: "Validation failed", errors: errors.array() },
        });
    }

    try {
        const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
        
        const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

        if (!taxDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9109; // Tax detail not found error

            logger.logWithMeta("error", "Tax Detail not found", {
                errorCode,
                executionTime,
                logId,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(404).json({
                meta: { statusCode: 404, errorCode, executionTime, hospitalDatabase },
                error: { message: "Tax Detail not found" },
            });
        }

        await taxDetail.update(req.body);

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Detail updated successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: {
                message: "Tax Detail updated successfully",
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: taxDetail,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9110; // Error updating tax detail

        logger.logWithMeta("error", "Error updating Tax Detail", {
            errorCode,
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error updating Tax Detail: " + error.message },
        });
    }
};

// exports.updateTaxDetails = async (req, res) => {
//     const errors = validationResult(req);
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const { id } = req.params;
//   const hospitalDatabase = req.hospitalDatabase;
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
// }

//   try {
//       const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
//       const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

//       if (!taxDetail) {
//           return res.status(404).json({ message: "Tax Detail not found" });
//       }

//       await taxDetail.update(req.body);

//       res.status(200).json({
//           meta: {
//               message: "Tax Detail updated successfully",
//               statusCode: 200,
//               executionTime: `${Date.now() - start}ms`,
//               hospitalDatabase,
//           },
//           data: taxDetail,
//       });

//   } catch (error) {
//       res.status(500).json({
//           meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
//           error: { message: "Error updating Tax Detail: " + error.message },
//       });
//   }
// };

exports.deleteTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    try {
        const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);

        const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

        if (!taxDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9111; // Tax detail not found error

            logger.logWithMeta("error", "Tax Detail not found", {
                errorCode,
                executionTime,
                logId,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(404).json({
                meta: { statusCode: 404, errorCode, executionTime, hospitalDatabase },
                error: { message: "Tax Detail not found" },
            });
        }

        await taxDetail.destroy();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Detail deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: {
                message: "Tax Detail deleted successfully",
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9112; // Error deleting tax detail

        logger.logWithMeta("error", "Error deleting Tax Detail", {
            errorCode,
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error deleting Tax Detail: " + error.message },
        });
    }
};

// exports.deleteTaxDetails = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const { id } = req.params;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//       const Tax_Details = require("../models/Tax_Details_model")(req.sequelize, Sequelize.DataTypes);
      
//       const taxDetail = await Tax_Details.findOne({ where: { Tax_Details_id: id } });

//       if (!taxDetail) {
//           return res.status(404).json({ message: "Tax Detail not found" });
//       }

//       await taxDetail.destroy();

//       res.status(200).json({
//           meta: {
//               message: "Tax Detail deleted successfully",
//               statusCode: 200,
//               executionTime: `${Date.now() - start}ms`,
//               hospitalDatabase,
//           }
//       });

//   } catch (error) {
//       res.status(500).json({
//           meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
//           error: { message: "Error deleting Tax Detail: " + error.message },
//       });
//   }
// };

