const logger = require('../logger');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require("uuid");
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalModel"); 
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

// exports.createTax = async (req, res) => {
//   const errors = validationResult(req);
//   const start = Date.now();
  
//   const { tax_name, tax_rate, is_active, HospitalIDR } = req.body;
//   const hospitalDatabase = req.hospitalDatabase;

//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const logId = uuidv4();

//   if (!errors.isEmpty()) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9084; // Validation error

//       logger.logWithMeta("error", "Validation error in createTax", {
//           errorCode,
//           logId,
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
//           statusCode: 400,
//           errorCode,
//           errors: errors.array(),
//       });
//   }

//   try {
//       if (!req.sequelize) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9085; // Database connection error

//           logger.logWithMeta("error", "Database connection not found", {
//               errorCode,
//               executionTime,
//               hospitalName: req.hospitalName || "Unknown",
//               ip: clientIp,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//           });

//           return res.status(500).json({
//               message: "Database connection not found",
//               statusCode: 500,
//               errorCode
//           });
//       }

//       const Tax = require("../models/Tax_Model")(req.sequelize);
//       const Hospital = require("../models/HospitalModel")(req.sequelize);

//       // **Validate HospitalID**
//       const hospital = await Hospital.findOne({ where: { HospitalID: HospitalIDR } });

//       if (!hospital) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9086; // HospitalID not found

//           logger.logWithMeta("error", "Invalid HospitalID, not found in hospital table", {
//               errorCode,
//               executionTime,
//               hospitalId: HospitalIDR,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//               ip: clientIp
//           });

//           return res.status(400).json({
//               errorCode,
//               message: "Invalid HospitalID, not found in hospital table",
//           });
//       }

//       await Tax.sync();

//       // **Create Tax Entry**
//       const tax = await Tax.create({
//           tax_name, tax_rate, is_active, HospitalIDR
//       });

//       const executionTime = `${Date.now() - start}ms`;

//       logger.logWithMeta("info", "Tax created successfully", {
//           executionTime,
//           logId,
//           hospitalId: HospitalIDR,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//           meta: {
//               statusCode: 200,
//               executionTime,
//               hospitalDatabase,
//           },
//           data: tax,
//       });

//   } catch (error) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9087; // General error in tax creation

//       logger.logWithMeta("error", "Error creating Tax", {
//           errorCode,
//           executionTime,
//           hospitalId: HospitalIDR,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//           errorMessage: error.message
//       });

//       res.status(500).json({
//           meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//           error: { message: "Error creating Tax: " + error.message },
//       });
//   }
// };
exports.createTax = async (req, res) => {
  const errors = validationResult(req);
    const start = Date.now();
    
    const { tax_name,tax_rate,is_active,HospitalIDR,} = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9084; // Validation error
  
        logger.logWithMeta("error", "Validation error in createTax", {
            errorCode,
            logId,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
            createdBy: req.username,
            updatedBy:req.username
        });
  
        return res.status(400).json({ 
            message: "Validation failed", 
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }
  
  
    try {
      const Tax = require("../models/Tax_Model")(req.sequelize);
  
  
      const group = await Group.findOne({ where: { HospitalID: HospitalIDR} });
  
      // console.log("group0000000000",group)
  
      if (!group) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9086; // HospitalID not found

        logger.logWithMeta("error", "Invalid HospitalID, not found in hospital table", {
            errorCode,
            executionTime,
            hospitalId: HospitalIDR,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            ip: clientIp
        });

        return res.status(400).json({
            errorCode,
            message: "Invalid HospitalID, not found in hospital table",
        });
    }
      await Tax.sync();
  
      const tax = await Tax.create({
        tax_name,tax_rate,is_active,HospitalIDR,
        createdBy: req.username,
        // updatedBy:req.username
      });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Tax created successfully", {
        executionTime,
        logId,
        hospitalId: HospitalIDR,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy:req.username
    });
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime,
          hospitalDatabase,
        },
        data: { Tax },
      });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9087; // General error in tax creation
  
        logger.logWithMeta("error", "Error creating Tax", {
            errorCode,
            executionTime,
            hospitalId: HospitalIDR,
            hospitalName: req.hospitalName,
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });
  
        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating Tax: " + error.message },
        });
    }
  };
exports.gettax = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const { tax_id } = req.query; // Get tax_id from query params
  const hospitalDatabase = req.hospitalDatabase;
  const logId = uuidv4();

  try {
      if (!req.sequelize) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9088; // Database connection error

          logger.logWithMeta("error", "Database connection not found", {
              errorCode,
              executionTime,
              hospitalName: req.hospitalName || "Unknown",
              ip: clientIp,
              city: locationData?.city,
              country: locationData?.country,
              apiName: req.originalUrl,
              method: req.method,
              userAgent: req.headers["user-agent"],
              createdBy: req.username,
              updatedBy:req.username
          });

          return res.status(500).json({
              message: "Database connection not found",
              statusCode: 500,
              errorCode
          });
      }

      const Tax = require("../models/Tax_Model")(req.sequelize); // Initialize model with Sequelize instance

      let response;
      if (tax_id) {
          // Fetch single tax record by ID
          response = await Tax.findOne({ where: { tax_id } });

          if (!response) {
              const executionTime = `${Date.now() - start}ms`;
              const errorCode = 9089; // Tax record not found

              logger.logWithMeta("error", "Tax record not found", {
                  errorCode,
                  executionTime,
                  hospitalName: req.hospitalName,
                  ip: clientIp,
                  city: locationData?.city,
                  country: locationData?.country,
                  apiName: req.originalUrl,
                  method: req.method,
                  userAgent: req.headers["user-agent"],
                  tax_id,
                  createdBy: req.username,
                  updatedBy:req.username
              });

              return res.status(404).json({
                  message: "Tax record not found",
                  statusCode: 404,
                  errorCode
              });
          }
      } else {
          // Fetch all tax records
          response = await Tax.findAll();
      }

      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", `Fetched ${tax_id ? "tax by ID" : "all tax records"} successfully`, {
          executionTime,
          logId,
          hospitalName: req.hospitalName,
          ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          tax_id,
          createdBy: req.username,
          updatedBy:req.username
      });

      res.status(200).json({
          meta: { statusCode: 200, executionTime, hospitalDatabase },
          data: response,
      });

  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9090; // General error in fetching tax records

      logger.logWithMeta("error", "Error fetching tax records", {
          errorCode,
          executionTime,
          hospitalName: req.hospitalName,
          ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          tax_id,
          errorMessage: error.message,
          createdBy: req.username,
          updatedBy:req.username
      });

      res.status(500).json({
          meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
          error: { message: "Error fetching tax records: " + error.message },
      });
  }
};

  // exports.gettax = async (req, res) => {
  //   const start = Date.now();
  //   const clientIp = await getClientIp(req);
  //   const { tax_id } = req.query; // Get ledger_id from query params
  //   const hospitalDatabase = req.hospitalDatabase;
  
  //   try {
  //     // Load Sequelize models properly
  //     const taxModel = require("../models/Tax_Model");
  //     const Tax = taxModel(req.sequelize); // Initialize model with Sequelize instance
  
  //     if (tax_id) {
  //       // Fetch single record by ID
  //       const tax = await Tax.findOne({ where: { tax_id } });
  //       if (!tax) {
  //         const executionTime = `${Date.now() - start}ms`;
  //         const errorCode = 1270;
      
  //         logger.logWithMeta("error", "Error fetching Tax", {
  //           errorCode,
  //           executionTime,
  //           hospitalId: req.hospitalId,
  //           apiName: req.originalUrl,
  //           method: req.method,
  //           userAgent: req.headers["user-agent"],
  //         });
  //         return res.status(404).json({errorCode, message: "Tax not found" });
  //       }
  //       return res.status(200).json({
  //         meta: { statusCode: 200, hospitalDatabase },
  //         data: tax,
  //       });
  //     } else {
  //       // Fetch all records
  //       const tax = await Tax.findAll();
  //       return res.status(200).json({
  //         meta: { statusCode: 200, hospitalDatabase },
  //         data: tax,
  //       });
  //     }
  //   } catch (error) {
  //     const executionTime = `${Date.now() - start}ms`;
  //     const errorCode = 1271;
  
  //     logger.logWithMeta("error", "Error fetching Tax", {
  //       errorCode,
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  
  //     res.status(500).json({
  //       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
  //       error: { message: "Error fetching Tax: " + error.message },
  //     });
  //   }
  // };
  
  exports.getTaxById = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9091; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(500).json({
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Tax = require("../models/Tax_Model")(req.sequelize);
        const tax = await Tax.findByPk(id);

        if (!tax) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9092; // Tax record not found

            logger.logWithMeta("error", "Tax record not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                tax_id: id,
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(404).json({
                message: "Tax record not found",
                statusCode: 404,
                errorCode
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fetched tax record successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime, hospitalDatabase },
            data: tax,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9093; // General error in fetching tax by ID

        logger.logWithMeta("error", "Error retrieving tax record", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error retrieving tax record: " + error.message },
        });
    }
};
  // exports.getTaxById = async (req, res) => {
  //   const start = Date.now();
  //   const clientIp = await getClientIp(req);
  //   const { id } = req.params;
  
  //   try {
  //     const Tax = require("../models/Tax_Model")(req.sequelize);
  //     const tax = await Tax.findByPk(id);
  
  //     if (!tax) {
  //       const executionTime = `${Date.now() - start}ms`;
  //       const errorCode = 1272;
    
  //       logger.logWithMeta("error", "Tax not found", {
  //         errorCode,
  //         executionTime,
  //         hospitalId: req.hospitalId,
  //         apiName: req.originalUrl,
  //         method: req.method,
  //         userAgent: req.headers["user-agent"],
  //       });
  //       return res.status(404).json({ errorCode,message: "Tax not found" });
  //     }
  
  //     const executionTime = `${Date.now() - start}ms`;
  //     res.status(200).json({
  //       meta: { statusCode: 200, executionTime },
  //       data: tax,
  //     });
  //   } catch (error) {
  //     const executionTime = `${Date.now() - start}ms`;
  //     const errorCode = 1273;
  
  //     logger.logWithMeta("error", "Error retrieving Tax", {
  //       errorCode,
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  //     res.status(500).json({errorCode, message: "Error retrieving Tax", error: error.message });
  //   }
  // };
  exports.updateTax = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const updateData = req.body;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9094; // Validation error

        logger.logWithMeta("error", "Validation error in updateTax", {
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
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(400).json({
            message: "Validation failed",
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9095; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(500).json({
                message: "Database connection not found",
                statusCode: 500,
                errorCode,
            });
        }

        const Tax = require("../models/Tax_Model")(req.sequelize);
        const tax = await Tax.findByPk(id);

        if (!tax) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9096; // Tax record not found

            logger.logWithMeta("error", "Tax record not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                tax_id: id,
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(404).json({
                message: "Tax record not found",
                statusCode: 404,
                errorCode,
            });
        }

        await tax.update({...updateData,  updatedBy: req.username,  // Track who updated it
            updatedAt: new Date(), });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax record updated successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime, hospitalDatabase },
            message: "Tax record updated successfully",
            data: tax,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9097; // General error in updating tax

        logger.logWithMeta("error", "Error updating tax record", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error updating tax record: " + error.message },
        });
    }
};
  // exports.updateTax = async (req, res) => {
  //   const errors = validationResult(req);
  //   const start = Date.now();
  //   const clientIp = await getClientIp(req);
  //   const { id } = req.params;
  //   const updateData = req.body;
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  // }
  
  //   try {
  //     const tax = require("../models/Tax_Model")(req.sequelize);
  //     const Tax = await tax.findByPk(id);
  
  //     if (!Tax) {
  //       const executionTime = `${Date.now() - start}ms`;
  //       const errorCode = 1276;
    
  //       logger.logWithMeta("error", "tax not found", {
  //         errorCode,
  //         executionTime,
  //         hospitalId: req.hospitalId,
  //         apiName: req.originalUrl,
  //         method: req.method,
  //         userAgent: req.headers["user-agent"],
  //       });
    
  
  //       return res.status(404).json({ message: "tax not found" });
  //     }
  
  //     await Tax.update(updateData);
  
  //     const executionTime = `${Date.now() - start}ms`;
  //     logger.logWithMeta("info", "tax updated successfully", {
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  
  //     res.status(200).json({
  //       meta: { statusCode: 200, executionTime },
  //       message: "tax updated successfully",
  //       data: Tax,
  //     });
  //   } catch (error) {
  //     const executionTime = `${Date.now() - start}ms`;
  //     const errorCode = 1277;
  
  //     logger.logWithMeta("error", "Error updating tax", {
  //       errorCode,
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  
  //     res.status(500).json({
  //       meta: { statusCode: 500, errorCode, executionTime },
  //       error: { message: "Error updating tax: " + error.message },
  //     });
  //   }
  // };
  // exports.deletetax = async (req, res) => {
  //   const start = Date.now();
  //   const clientIp = await getClientIp(req);
  //   const { id } = req.params;
  
  //   try {
  //     const tax = require("../models/Tax_Model")(req.sequelize);
  //     const Tax = await tax.findByPk(id);
  
  //     if (!Tax) {
  //       const executionTime = `${Date.now() - start}ms`;
  //     const errorCode = 1274;
  
  //     logger.logWithMeta("error", "tax not found", {
  //       errorCode,
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  //       return res.status(404).json({errorCode, message: "tax not found" });
  //     }
  
  //     await Tax.destroy();
  
  //     const executionTime = `${Date.now() - start}ms`;
      
  //     logger.logWithMeta("info", "tax deleted successfully", {
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  
  //     res.status(200).json({
  //       meta: { statusCode: 200, executionTime },
  //       message: "tax deleted successfully",
  //     });
  //   } catch (error) {
  //     const executionTime = `${Date.now() - start}ms`;
  //     const errorCode = 1275;
  
  //     logger.logWithMeta("error", "Error deleting tax", {
  //       errorCode,
  //       executionTime,
  //       hospitalId: req.hospitalId,
  //       apiName: req.originalUrl,
  //       method: req.method,
  //       userAgent: req.headers["user-agent"],
  //     });
  
  //     res.status(500).json({
  //       meta: { statusCode: 500, errorCode, executionTime },
  //       error: { message: "Error deleting tax: " + error.message },
  //     });
  //   }
  // };
  
  exports.deleteTax = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9098; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(500).json({
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Tax = require("../models/Tax_Model")(req.sequelize);
        const tax = await Tax.findByPk(id);

        if (!tax) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9099; // Tax record not found

            logger.logWithMeta("error", "Tax record not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                tax_id: id,
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(404).json({
                message: "Tax record not found",
                statusCode: 404,
                errorCode
            });
        }

        await tax.destroy();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax record deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime, hospitalDatabase },
            message: "Tax record deleted successfully",
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9100; // General error in deleting tax

        logger.logWithMeta("error", "Error deleting tax record", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            tax_id: id,
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error deleting tax record: " + error.message },
        });
    }
};
