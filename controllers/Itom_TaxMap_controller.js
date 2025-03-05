
const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('../logger'); 
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const HospitalId = require("../models/HospitalModel");
const { validationResult } = require('express-validator');
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
// async function getClientIp(req) {
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

//   // If IP is localhost or private, try fetching the public IP
//   if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
//     try {
//       const ipResponse = await axios.get('https://api.ipify.org?format=json');
//       clientIp = ipResponse.data.ip;
//     } catch (error) {
//       logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 971 });
//     //   clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
//     }
//   }

//   return clientIp;
// }

// exports.createTaxMap = async (req, res) => {
//   const errors = validationResult(req);
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const logId = uuidv4();

//   if (!errors.isEmpty()) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9140;

//       logger.logWithMeta("error", "Validation error in createTaxMap", {
//           errorCode,
//           executionTime,
//           logId,
//           hospitalName: req.hospitalName || "Unknown",
//           ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//           validationErrors: errors.array(),
//       });

//       return res.status(400).json({
//           meta: { statusCode: 400, errorCode, executionTime },
//           error: { message: "Validation failed", errors: errors.array() },
//       });
//   }

//   const { item_IDR, tax_IDR, hospital_IDR, type } = req.body;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//       // Load Sequelize models dynamically
//       const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
//       const Hospital = require("../models/HospitalModel")(req.sequelize);
//       const Item = require("../models/Item_Model")(req.sequelize);
//       const Tax = require("../models/Tax_Model")(req.sequelize);

//       // Validate Hospital
//       const hospital = await Hospital.findOne({ where: { hospitalId: hospital_IDR } });
//       if (!hospital) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9141;

//           logger.logWithMeta("error", "Invalid hospital_IDR, not found in MasterDB", {
//               errorCode,
//               executionTime,
//               logId,
//               hospitalName: req.hospitalName,
//               ip: clientIp,
//               city: locationData?.city,
//               country: locationData?.country,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//           });

//           return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid hospital_IDR, not found in MasterDB" } });
//       }

//       // Validate Item
//       const item = await Item.findOne({ where: { Item_id: item_IDR } });
//       if (!item) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9142;

//           logger.logWithMeta("error", "Invalid item_IDR, not found in MasterDB", {
//               errorCode,
//               executionTime,
//               logId,
//               hospitalName: req.hospitalName,
//               ip: clientIp,
//               city: locationData?.city,
//               country: locationData?.country,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//           });

//           return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid item_IDR, not found in MasterDB" } });
//       }

//       // Validate Tax
//       const tax = await Tax.findOne({ where: { tax_id: tax_IDR } });
//       if (!tax) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9143;

//           logger.logWithMeta("error", "Invalid tax_IDR, not found in MasterDB", {
//               errorCode,
//               executionTime,
//               logId,
//               hospitalName: req.hospitalName,
//               ip: clientIp,
//               city: locationData?.city,
//               country: locationData?.country,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//           });

//           return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid tax_IDR, not found in MasterDB" } });
//       }

//       // Create TaxMap entry
//       await TaxMap.sync();
//       const taxMapEntry = await TaxMap.create({ item_IDR, tax_IDR, hospital_IDR, type });

//       const executionTime = `${Date.now() - start}ms`;

//       logger.logWithMeta("info", "Tax Map entry created successfully", {
//           executionTime,
//           logId,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//           meta: { statusCode: 200, executionTime, hospitalDatabase },
//           data: taxMapEntry,
//       });
//   } catch (error) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9144;

//       logger.logWithMeta("error", "Error creating tax map entry", {
//           errorCode,
//           executionTime,
//           logId,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//           errorMessage: error.message,
//       });

//       res.status(500).json({
//           meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//           error: { message: "Error creating tax map entry: " + error.message },
//       });
//   }
// };

exports.createTaxMap = async (req, res) => {
 const errors = validationResult(req);

    const start = Date.now();
    const clientIp = await getClientIp(req);
  console.log('Client IP:', clientIp);

    // const logId = uuidv4();

    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9140;
  
        logger.logWithMeta("error", "Validation error in createTaxMap", {
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
            message: "Validation failed", 
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }


    const { item_IDR,tax_IDR,hospital_IDR,type } = req.body;
    
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Tax_map = require("../models/Itom_TaxMap_model")(req.sequelize);
    
        const tax_map = await HospitalId.findOne({ where: { hospitalId: hospital_IDR } });

        // console.log("tax_map0000000000", tax_map)


        if (!tax_map) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9141;
  
            logger.logWithMeta("error", "Invalid hospital_IDR, not found in MasterDB", {
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
  
            return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid hospital_IDR, not found in MasterDB" } });
        }



        const item_ID = require("../models/Item_Model")(req.sequelize);

        const Item_IDR = await item_ID.findOne({
            where: {Item_id : item_IDR }
        });

        if (!Item_IDR) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9142;
  
            logger.logWithMeta("error", "Invalid item_IDR, not found in MasterDB", {
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
  
            return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid item_IDR, not found in MasterDB" } });
        }


        const tax_ID = require("../models/Tax_Model")(req.sequelize);

        const Tax_IDR = await tax_ID.findOne({
            where: { tax_id: tax_IDR }
        });

        if (!Tax_IDR) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9143;
  
            logger.logWithMeta("error", "Invalid tax_IDR, not found in MasterDB", {
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
  
            return res.status(400).json({ meta: { statusCode: 400, errorCode, executionTime }, error: { message: "Invalid tax_IDR, not found in MasterDB" } });
        }





        await Tax_map.sync();

        const service = await Tax_map.create({
          item_IDR,tax_IDR,hospital_IDR,type
        });






        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Tax Map entry created successfully", {
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
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: { service },
        });
    } catch (error)  {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9144;
  
        logger.logWithMeta("error", "Error creating tax map entry", {
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
            error: { message: "Error creating tax map entry: " + error.message },
        });
    }
};

exports.getAllTaxMaps = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const logId = uuidv4();
  const { id } = req.query; // Fetch specific taxMap by ID if provided
  const hospitalDatabase = req.hospitalDatabase;

  try {
      // Load Sequelize model dynamically
      const Tax_Map = require("../models/Itom_TaxMap_model")(req.sequelize);

      let taxMaps;
      if (id) {
          // Fetch single record by ID
          taxMaps = await Tax_Map.findOne({ where: { taxMap_id: id } });

          if (!taxMaps) {
              const executionTime = `${Date.now() - start}ms`;
              const errorCode = 9145;

              logger.logWithMeta("error", "TaxMap entry not found", {
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

              return res.status(404).json({ meta: { statusCode: 404, errorCode, executionTime }, error: { message: "TaxMap entry not found" } });
          }
      } else {
          // Fetch all records
          taxMaps = await Tax_Map.findAll();
      }

      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", `Fetched ${id ? "TaxMap by ID" : "all TaxMaps"} successfully`, {
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
          meta: { statusCode: 200, executionTime, hospitalDatabase },
          data: taxMaps,
      });
  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9146;

      logger.logWithMeta("error", "Error fetching TaxMaps", {
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
          error: { message: "Error fetching TaxMaps: " + error.message },
      });
  }
};

// exports.getAllTaxMaps = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();
//   const { id } = req.query; // Get ledger_id from query params
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//     // Load Sequelize models properly
//     const Tax_Map = require("../models/Itom_TaxMap_model");
//     const tax_map = Tax_Map(req.sequelize); // Initialize model with Sequelize instance

//     if (id) {
//       // Fetch single record by ID
//       const item = await tax_map.findOne({ where: { taxMap_id } });
//       if (!item) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 1270;
    
//         logger.logWithMeta("error", "Error fetching tax_map", {
//           errorCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//         });
//         return res.status(404).json({errorCode, message: "tax_map not found" });
//       }
//       return res.status(200).json({
//         meta: { statusCode: 200, hospitalDatabase },
//         data: accLedger,
//       });
//     } else {
//       // Fetch all records
//       const tax_maps = await tax_map.findAll();
//       return res.status(200).json({
//         meta: { statusCode: 200, hospitalDatabase },
//         data: tax_maps,
//       });
//     }
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1271;

//     logger.logWithMeta("error", "Error fetching tax_map", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error fetching tax_map: " + error.message },
//     });
//   }
// };


exports.getTaxMapById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const logId = uuidv4();
  const { taxMap_id } = req.params;

  try {
      // Ensure model initialization with Sequelize instance
      const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);

      // Fetch the tax map entry by primary key
      const taxMap = await TaxMap.findByPk(taxMap_id);

      if (!taxMap) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9147;

          logger.logWithMeta("error", "TaxMap entry not found", {
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
              meta: { statusCode: 404, errorCode, executionTime },
              error: { message: "TaxMap entry not found" },
          });
      }

      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", "Fetched TaxMap by ID successfully", {
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
          meta: { statusCode: 200, executionTime },
          data: taxMap,
      });
  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9148;

      logger.logWithMeta("error", "Error retrieving TaxMap", {
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
          meta: { statusCode: 500, errorCode, executionTime },
          error: { message: "Error retrieving TaxMap: " + error.message },
      });
  }
};

// exports.getTaxMapById = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();
//   const { taxMap_id } = req.params;

//   try {
//     // Ensure model initialization with Sequelize instance
//     const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);

//     // Fetch the tax map entry by primary key
//     const taxmap = await TaxMap.findByPk(taxMap_id);

//     if (!taxmap) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1272;

//       logger.logWithMeta("error", "Tax map not found", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         ip: clientIp,
//       });

//       return res.status(404).json({ errorCode, message: "Tax map not found" });
//     }

//     const executionTime = `${Date.now() - start}ms`;

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime },
//       data: taxmap, // Fix: Returning the correct variable
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1273;

//     logger.logWithMeta("error", "Error retrieving tax map", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       ip: clientIp,
//       error: error.message,
//     });

//     res.status(500).json({
//       errorCode,
//       message: "Error retrieving tax map",
//       error: error.message,
//     });
//   }
// };


exports.deleteTaxMap = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const logId = uuidv4();
  const { taxMap_id } = req.params;

  try {
      // Ensure model initialization with Sequelize instance
      const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
      const taxMap = await TaxMap.findByPk(taxMap_id);

      if (!taxMap) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9149;

          logger.logWithMeta("error", "TaxMap entry not found", {
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
              meta: { statusCode: 404, errorCode, executionTime },
              error: { message: "TaxMap entry not found" },
          });
      }

      await taxMap.destroy();
      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", "TaxMap deleted successfully", {
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
          meta: { statusCode: 200, executionTime },
          message: "TaxMap deleted successfully",
      });
  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9150;

      logger.logWithMeta("error", "Error deleting TaxMap", {
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
          meta: { statusCode: 500, errorCode, executionTime },
          error: { message: "Error deleting TaxMap: " + error.message },
      });
  }
};

// exports.deleteTaxMap = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();
//   const { taxMap_id } = req.params;

//   try {
//     const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
//     const taxmap = await TaxMap.findByPk(taxMap_id);

//     if (!taxmap) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1274;

//       logger.logWithMeta("error", "Tax map not found", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         ip: clientIp,
//       });

//       return res.status(404).json({ errorCode, message: "Tax map not found" });
//     }

//     await taxmap.destroy();

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Tax map deleted successfully", {
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       ip: clientIp,
//     });

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime },
//       message: "Tax map deleted successfully",
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1275;

//     logger.logWithMeta("error", "Error deleting tax map", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       ip: clientIp,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: "Error deleting tax map: " + error.message },
//     });
//   }
// };

exports.updateTaxMap = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const logId = uuidv4();
  const { taxMap_id } = req.params;
  const updateData = req.body;

  // Validation error handling
  if (!errors.isEmpty()) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9151; // Validation error

      logger.logWithMeta("error", "Validation error in updateTaxMap", {
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
          meta: { statusCode: 400, errorCode, executionTime },
          error: { message: "Validation failed", errors: errors.array() },
      });
  }

  try {
      // Ensure model initialization with Sequelize instance
      const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
      const taxMap = await TaxMap.findByPk(taxMap_id);

      if (!taxMap) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9152;

          logger.logWithMeta("error", "TaxMap entry not found", {
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
              meta: { statusCode: 404, errorCode, executionTime },
              error: { message: "TaxMap entry not found" },
          });
      }

      // Perform the update
      await taxMap.update(updateData);
      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", "TaxMap updated successfully", {
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
          meta: { statusCode: 200, executionTime },
          message: "TaxMap updated successfully",
          data: taxMap,
      });
  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9153;

      logger.logWithMeta("error", "Error updating TaxMap", {
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
          meta: { statusCode: 500, errorCode, executionTime },
          error: { message: "Error updating TaxMap: " + error.message },
      });
  }
};

// exports.updateTaxMap = async (req, res) => {
//   const errors = validationResult(req);
//   const start = Date.now();
//   const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();
//   const clientIp = await getClientIp(req);
//   const { taxMap_id } = req.params;
//   const updateData = req.body;

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
//     const taxmap = await TaxMap.findByPk(taxMap_id);

//     if (!taxmap) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1276;

//       logger.logWithMeta("error", "Tax map not found", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         ip: clientIp,
//       });

//       return res.status(404).json({ errorCode, message: "Tax map not found" });
//     }

//     await taxmap.update(updateData);

//     const executionTime = `${Date.now() - start}ms`;
//     logger.logWithMeta("info", "Tax map updated successfully", {
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       ip: clientIp,
//     });

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime },
//       message: "Tax map updated successfully",
//       data: taxmap, // Fix: Corrected variable reference
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1277;

//     logger.logWithMeta("error", "Error updating tax map", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       ip: clientIp,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: "Error updating tax map: " + error.message },
//     });
//   }
// };
