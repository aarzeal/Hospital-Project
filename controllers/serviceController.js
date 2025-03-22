

const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const getClientIp = require('../util/clientip');

const getLocationData = require("../util/locationHelper");
const { validationResult } = require('express-validator');
// const Service_category = require("../models/HospitalGroup");

// const AccLedgermodel = require("../models/AccLedger"); 
dotenv.config();

// exports.createService = async (req, res) => {
//     const start = Date.now();
//     const errors = validationResult(req);
//     const clientIp = await getClientIp(req);
//     const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();

//     if (!errors.isEmpty()) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 9047; // Validation error

//         logger.logWithMeta("error", "Validation error in createService", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName || "Unknown",
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             validationErrors: errors.array(),
//         });

//         return res.status(400).json({ 
//             message: "Validation failed", 
//             statusCode: 400,
//             errorCode,
//             errors: errors.array(),
//         });
//     }

//     const { service_code, service_name, service_type, service_category_IDR, service_charge_applicable, 
//             service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR } = req.body;
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         if (!req.sequelize) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9048; // Database connection error

//             logger.logWithMeta("error", "Database connection not found", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName || "Unknown",
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//             });

//             return res.status(500).json({ 
//                 message: "Database connection not found", 
//                 statusCode: 500, 
//                 errorCode 
//             });
//         }

//         const Service = require("../models/ser")(req.sequelize);
//         const Group = require("../models/HospitalGroup")(req.sequelize);

//         // Validate HospitalGroupID
//         const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });
//         if (!group) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9049; // HospitalGroupID not found

//             logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 HospitalGroupIDR
//             });

//             return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB", errorCode });
//         }

//         const Service_category = require("../models/servicecategory")(req.sequelize);
//         const service_category = await Service_category.findOne({ where: { servicecategoryId: service_category_IDR } });

//         if (!service_category) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9050; // Service Category ID not found

//             logger.logWithMeta("error", "Invalid Service Category ID, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 service_category_IDR
//             });

//             return res.status(400).json({ message: "Invalid Service Category ID, not found in MasterDB", errorCode });
//         }

//         const AccLedger = require("../models/AccLedger")(req.sequelize);
//         const accLedger = await AccLedger.findOne({ where: { ledger_id: ledger_IDR } });

//         if (!accLedger) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9051; // Ledger ID not found

//             logger.logWithMeta("error", "Invalid ledger_IDR, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 ledger_IDR
//             });

//             return res.status(400).json({ message: "Invalid ledger_IDR, not found in MasterDB", errorCode });
//         }
        
//         const existingService = await Service.findOne({
//             where: { service_name, HospitalGroupIDR }
//         });

//         if (existingService) {
//             return res.status(409).json({ 
//                 message: "Service name already exists. Please use a different name.", 
//                 errorCode: 9154 
//             });
//         }

//         await Service.sync();

//         const service = await Service.create({
//             service_code, service_name, service_type, service_category_IDR, 
//             service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR
//         });

//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", "Service created successfully", {
//             executionTime,
//             logId,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             data: [
//                 { service_code, service_name, service_type }
//             ]
//         });

//         res.status(201).json({
//             meta: { statusCode: 201, executionTime, hospitalDatabase },
//             data: { service },
//         });

//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 9052; // General error in creating service

//         logger.logWithMeta("error", "Error creating service", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             errorMessage: error.message
//         });

//         res.status(500).json({
//             meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//             error: { message: "Error creating service: " + error.message },
//         });
//     }
// };

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
// exports.ensureSequelizeInstance = (req, res, next) => {
//     const start = Date.now();
//     // const clientIp = await getClientIp(req);

//     if (!req.hospitalDatabase) {
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 937;
//         const statusCode = 500;
//         // Log the warning
//         logger.logWithMeta("warn", `Database connection not established`, {
//             errorCode,
//             statusCode,
//             executionTime,
//             hospitalName: req.hospitalName,
//             // ip: clientIp,
//             apiName: req.originalUrl, // API name
//             method: req.method,
//             userAgent: req.headers["user-agent"], // HTTP method
//         });
//         // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

//         return res.status(statusCode).json({
//             meta: {
//                 statusCode: statusCode,
//                 errorCode: 937,
//                 executionTime: `${end - start}ms`,
//             },

//             error: {
//                 message: "Database connection not established",
//             },
//         });
//     }

//     const sequelize = new Sequelize(
//         req.hospitalDatabase,
//         process.env.DB_USER,
//         process.env.DB_PASSWORD,
//         {
//             host: process.env.DB_HOST,
//             dialect: process.env.DB_DIALECT,
//             logging: false,
//         }
//     );

//     req.sequelize = sequelize;
//     // logger.info('Sequelize instance created successfully');
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
//     //   executionTime,
//     //   statusCode: 200,
//     //   hospitalName: req.hospitalName,
//     //   // ip: clientIp,
//     //   apiName: req.originalUrl, // API name
//     //   method: req.method,
//     //   userAgent: req.headers["user-agent"], // HTTP method
//     // });

//     next();

//     sequelize
//         .sync({ alter: true })

//         .then(() => {
//             console.log("Database synchronized successfully.");
//         })

//         .catch((error) => {
//             console.error("Error synchronizing the database:", error);
//         });
// };

exports.createService = async (req, res) => {
 const errors = validationResult(req);
 const start = Date.now();
    
 const clientIp = await getClientIp(req);
 const locationData = await getLocationData(clientIp);
 const logId = uuidv4();

 if (!errors.isEmpty()) {
     const executionTime = `${Date.now() - start}ms`;
     const errorCode = 9047; // Validation error

     logger.logWithMeta("error", "Validation error in createFinYrDetails", {
         errorCode,
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

   
   


    const { service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Service = require("../models/ser")(req.sequelize);
        
        await Service.sync({ force: false });


        const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });


        // console.log("group0000000000", group)


        if (!group) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9048;
    
            logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
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
                createdBy: req.username,
                updatedBy:req.username
            });
            return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
        }



        const Service_category = require("../models/servicecategory")(req.sequelize);

        const service_category = await Service_category.findOne({
            where: { servicecategoryId: service_category_IDR }
        });

        if (!service_category) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9049;
    
            logger.logWithMeta("error", "Invalid Service Category ID, not found in MasterDB", {
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
                createdBy: req.username,
                updatedBy:req.username
            });
            return res.status(400).json({errorCode, message: "Invalid Service Category ID, not found in MasterDB" });
        }


        const AccLedger = require("../models/AccLedger")(req.sequelize);

        const accLedger = await AccLedger.findOne({
            where: { ledger_id: ledger_IDR }
        });

        if (!accLedger) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9050;
    
            logger.logWithMeta("error", "Invalid ledger_IDR, not found in MasterDB", {
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
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(400).json({ message: "Invalid ledger_IDR, not found in MasterDB" });
        }





        // await Service.sync();

        const service = await Service.create({
            service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR,
            createdBy: req.username,
            // updatedBy:req.username
        });






        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "service created successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy:req.username,
            
            
            data: [
                {
                    service_code: service_code,
                    service_name: service_name,
                    service_type:service_type

                }
            ]
            
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: { service },
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9051;

        logger.logWithMeta("error", "Error creating service", {
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
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating service: " + error.message },
        });
    }
};

exports.getService = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    const { id } = req.params; // If an ID is provided, fetch by ID; otherwise, fetch all
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9053; // Database connection error

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

        const Service = require("../models/ser")(req.sequelize);
        let response;

        if (id) {
            response = await Service.findOne({ where: { service_id: id } });

            if (!response) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 9054; // Service not found

                logger.logWithMeta("error", "Service not found", {
                    errorCode,
                    executionTime,
                    hospitalName: req.hospitalName,
                    ip: clientIp,
                    city: locationData?.city,
                    country: locationData?.country,
                    apiName: req.originalUrl,
                    method: req.method,
                    userAgent: req.headers["user-agent"],
                    service_id: id,
                    createdBy: req.username,
                    updatedBy:req.username
                });

                return res.status(404).json({
                    message: "Service not found",
                    statusCode: 404,
                    errorCode
                });
            }
        } else {
            response = await Service.findAll();
            if (!response || response.length === 0) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 9055; // No services found

                logger.logWithMeta("error", "No services found", {
                    errorCode,
                    executionTime,
                    hospitalName: req.hospitalName,
                    ip: clientIp,
                    city: locationData?.city,
                    country: locationData?.country,
                    apiName: req.originalUrl,
                    method: req.method,
                    userAgent: req.headers["user-agent"],
                    createdBy: req.username,
                    updatedBy:req.username
                });

                return res.status(404).json({
                    message: "No services found",
                    statusCode: 404,
                    errorCode
                });
            }
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", `Fetched ${id ? "service by ID" : "all services"} successfully`, {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_id: id || "all",
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: response,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9056; // General error in fetching service

        logger.logWithMeta("error", `Error fetching ${id ? "service by ID" : "all services"}`, {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_id: id || "all",
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: `Error fetching ${id ? "service by ID" : "services"}: ` + error.message },
        });
    }
};
// exports.getService = async (req, res) => {
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
//     const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();

//     if (!errors.isEmpty()) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 9047; // Validation error

//         logger.logWithMeta("error", "Validation error in createService", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName || "Unknown",
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             validationErrors: errors.array(),
//         });

//         return res.status(400).json({ 
//             message: "Validation failed", 
//             statusCode: 400,
//             errorCode,
//             errors: errors.array(),
//         });
//     }

//     const { id } = req.params;  // If an ID is provided, it will fetch by ID; otherwise, it fetches all
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         const Service = require("../models/ser")(req.sequelize);

//         let response;
//         if (id) {
//             response = await Service.findOne({ where: { service_id: id } });
//             if (!response) {
//                 const executionTime = `${Date.now() - start}ms`;
//                 const errorCode = 1282;
        
//                 logger.logWithMeta("error", `Service not found"}`, {
//                     errorCode,
//                     executionTime,
//                     hospitalName: req.hospitalName,
//                     ip: clientIp,
//                   city: locationData?.city,
//                   country: locationData?.country,
//                   regionName: locationData?.regionName,
//                   zip: locationData?.zip,
//                     apiName: req.originalUrl,
//                     method: req.method,
//                     userAgent: req.headers["user-agent"],
//                 });
//                 return res.status(404).json({errorCode, message: "Service not found" });
//             }
//         } else {
//             response = await Service.findAll();
//         }

//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", `Fetched ${id ? "service by ID" : "all services"} successfully`, {
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           regionName: locationData?.regionName,
//           zip: locationData?.zip,
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//         });

//         res.status(200).json({
//             meta: {
//                 statusCode: 200,
//                 executionTime,
//                 hospitalDatabase,
//             },
//             data: response,
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 1282;

//         logger.logWithMeta("error", `Error fetching ${id ? "service by ID" : "all services"}`, {
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

//         res.status(500).json({
//             meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//             error: { message: `Error fetching ${id ? "service by ID" : "services"}: ` + error.message },
//         });
//     }
// };
// exports.updateService = async (req, res) => {
//     const start = Date.now();
//     const errors = validationResult(req);
//     const clientIp = await getClientIp(req);
    // const locationData = await getLocationData(clientIp);
    // const logId = uuidv4();

    // if (!errors.isEmpty()) {
    //     const executionTime = `${Date.now() - start}ms`;
    //     const errorCode = 9057; // Validation error

    //     logger.logWithMeta("error", "Validation error in updateService", {
    //         errorCode,
    //         executionTime,
    //         hospitalName: req.hospitalName || "Unknown",
    //         ip: clientIp,
    //         apiName: req.originalUrl,
    //         method: req.method,
    //         userAgent: req.headers["user-agent"],
    //         validationErrors: errors.array(),
    //     });

    //     return res.status(400).json({
    //         message: "Validation failed",
    //         statusCode: 400,
    //         errorCode,
    //         errors: errors.array(),
    //     });
    // }

//     const { id } = req.params;
//     const { service_code, service_name, service_type, service_category_IDR, service_charge_applicable, 
//             service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR } = req.body;
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         if (!req.sequelize) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9058; // Database connection error

//             logger.logWithMeta("error", "Database connection not found", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName || "Unknown",
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//             });

//             return res.status(500).json({
//                 message: "Database connection not found",
//                 statusCode: 500,
//                 errorCode
//             });
//         }

//         const Service = require("../models/ser")(req.sequelize);
//         let service = await Service.findByPk(id);

//         if (!service) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9059; // Service not found

//             logger.logWithMeta("error", "Service not found", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 service_id: id
//             });

//             return res.status(404).json({
//                 message: "Service not found",
//                 statusCode: 404,
//                 errorCode
//             });
//         }

//         const Group = require("../models/HospitalGroup")(req.sequelize);
//         const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });

//         if (!group) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9060; // Invalid HospitalGroupID

//             logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 HospitalGroupIDR
//             });

//             return res.status(400).json({
//                 message: "Invalid HospitalGroupID, not found in MasterDB",
//                 statusCode: 400,
//                 errorCode
//             });
//         }

//         const AccLedger = require("../models/AccLedger")(req.sequelize);
//         const accLedger = await AccLedger.findOne({ where: { ledger_id: ledger_IDR } });

//         if (!accLedger) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9061; // Invalid Ledger ID

//             logger.logWithMeta("error", "Invalid ledger_IDR, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 ledger_IDR
//             });

//             return res.status(400).json({
//                 message: "Invalid ledger_IDR, not found in MasterDB",
//                 statusCode: 400,
//                 errorCode
//             });
//         }

//         const Service_category = require("../models/servicecategory")(req.sequelize);
//         const service_category = await Service_category.findOne({ where: { servicecategoryId: service_category_IDR } });

//         if (!service_category) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 9062; // Invalid Service Category ID

//             logger.logWithMeta("error", "Invalid Service Category ID, not found in MasterDB", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//                 city: locationData?.city,
//                 country: locationData?.country,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//                 service_category_IDR
//             });

//             return res.status(400).json({
//                 message: "Invalid Service Category ID, not found in MasterDB",
//                 statusCode: 400,
//                 errorCode
//             });
//         }

//         // **UPDATE SERVICE**
//         await service.update({
//             service_code, service_name, service_type, service_category_IDR, 
//             service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR
//         });

//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", "Service updated successfully", {
//             executionTime,
//             logId,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             service_id: id
//         });

//         res.status(200).json({
//             meta: { statusCode: 200, executionTime, hospitalDatabase },
//             data: { service },
//             message: "Service updated successfully"
//         });

//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 9063; // General error in updating service

//         logger.logWithMeta("error", "Error updating service", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             service_id: id,
//             errorMessage: error.message
//         });

//         res.status(500).json({
//             meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//             error: { message: "Error updating service: " + error.message },
//         });
//     }
// };
exports.updateService = async (req, res) => {
  
  const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9057; // Validation error

        logger.logWithMeta("error", "Validation error in updateService", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            logId,
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

    const { id } = req.params;
    const { service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Service = require("../models/ser")(req.sequelize);
       
        // 🔍 Validate Service Exists
        let service = await Service.findByPk(id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        // 🔍 Validate Hospital Group
        const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });
        if (!group) return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });

        
        const AccLedger = require("../models/AccLedger")(req.sequelize);

        const accLedger = await AccLedger.findOne({
            where: { ledger_id: ledger_IDR}
        });

        if (!accLedger) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1283;
    
            logger.logWithMeta("error", "Invalid Service AccLedger ID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                logId,
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,
                updatedBy:req.username
            });
    
            return res.status(400).json({errorCode, message: "Invalid Service AccLedger ID, not found in MasterDB" });
        }
        


        const Service_category = require("../models/servicecategory")(req.sequelize);

        const service_category = await Service_category.findOne({
            where: { servicecategoryId: service_category_IDR }
        });

        if (!service_category) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1284;
    
            logger.logWithMeta("error", "Invalid Service Category ID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                logId,
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,
                updatedBy:req.username
            });
    
            return res.status(400).json({ errorCode,message: "Invalid Service Category ID, not found in MasterDB" });
        }

        // **UPDATE SERVICE**
        await service.update({ service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR ,  updatedBy: req.username,  // Track who updated it
            updatedAt: new Date(), });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service updated successfully", {
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            logId,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
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
            data: { service },
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1285;

        logger.logWithMeta("error", "Error updating service", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            logId,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error updating service: " + error.message },
        });
    }
};
exports.deleteService = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    const { service_id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9064; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                logId,
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

        const Service = require("../models/ser")(req.sequelize);
        await Service.sync();

        const service = await Service.findOne({ where: { service_id } });

        if (!service) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9065; // Service not found

            logger.logWithMeta("error", "Service not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                logId,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                service_id,
                createdBy: req.username,
                updatedBy:req.username
            });

            return res.status(404).json({
                message: "Service not found",
                statusCode: 404,
                errorCode
            });
        }

        await service.destroy();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            logId,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_id,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            message: "Service deleted successfully",
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9066; // General error in deleting service

        logger.logWithMeta("error", "Error deleting service", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            logId,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_id,
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error deleting service: " + error.message },
        });
    }
};
// exports.deleteService = async (req, res) => {
//     const start = Date.now();
//     let locationData = { city: 'Unknown' };

//     try {
//       const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
//       locationData = locationResponse.data;
//       console.log('Location Data:', locationData);
//     } catch (error) {
//       logger.error('Error fetching location data', { error: error.message });
//     }

//     const clientIp = await getClientIp(req);
//     const { service_id } = req.params;
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         const Service = require("../models/ser")(req.sequelize);
//         await Service.sync();

//         const service = await Service.findOne({ where: { service_id } });
        
//         if (!service) {
//             const executionTime = `${Date.now() - start}ms`;
//             const errorCode = 1286;
    
//             logger.logWithMeta("error", "Service not found", {
//                 errorCode,
//                 executionTime,
//                 hospitalName: req.hospitalName,
//                 ip: clientIp,
//               city: locationData?.city,
//               country: locationData?.country,
//               regionName: locationData?.regionName,
//               zip: locationData?.zip,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers["user-agent"],
//             });
    
//             return res.status(404).json({errorCode, message: "Service not found" });
//         }

//         await service.destroy();
        
//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", "Service deleted successfully", {
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//           city: locationData?.city,
//           country: locationData?.country,
//           regionName: locationData?.regionName,
//           zip: locationData?.zip,
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//         });

//         res.status(200).json({
//             meta: {
//                 statusCode: 200,
//                 executionTime,
//                 hospitalDatabase,
//             },
//             message: "Service deleted successfully",
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 1287;

//         logger.logWithMeta("error", "Error deleting service", {
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

//         res.status(500).json({
//             meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//             error: { message: "Error deleting service: " + error.message },
//         });
//     }
// };










exports.getServicebyservicetype = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    const { service_type } = req.params; // If an ID is provided, fetch by ID; otherwise, fetch all
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9053; // Database connection error

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

        const Service = require("../models/ser")(req.sequelize);
        let response;

        if (service_type) {
            response = await Service.findOne({ where: { service_type: service_type } });

            if (!response) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 9054; // Service not found

                logger.logWithMeta("error", "Service not found", {
                    errorCode,
                    executionTime,
                    hospitalName: req.hospitalName,
                    ip: clientIp,
                    city: locationData?.city,
                    country: locationData?.country,
                    apiName: req.originalUrl,
                    method: req.method,
                    userAgent: req.headers["user-agent"],
                    // service_id: id,
                    createdBy: req.username,
                    updatedBy:req.username
                });

                return res.status(404).json({
                    message: "Service not found",
                    statusCode: 404,
                    errorCode
                });
            }
        } else {
            response = await Service.findAll();
            if (!response || response.length === 0) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 9055; // No services found

                logger.logWithMeta("error", "No services found", {
                    errorCode,
                    executionTime,
                    hospitalName: req.hospitalName,
                    ip: clientIp,
                    city: locationData?.city,
                    country: locationData?.country,
                    apiName: req.originalUrl,
                    method: req.method,
                    userAgent: req.headers["user-agent"],
                    createdBy: req.username,
                    updatedBy:req.username
                });

                return res.status(404).json({
                    message: "No services found",
                    statusCode: 404,
                    errorCode
                });
            }
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", `Fetched ${service_type ? "service by ID" : "all services"} successfully`, {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            // service_id: id || "all",
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: response,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9056; // General error in fetching service

        logger.logWithMeta("error", `Error fetching ${service_type ? "service by service_type" : "all services"}`, {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            // service_id: id || "all",
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: `Error fetching ${service_type ? "service by service_type" : "services"}: ` + error.message },
        });
    }
};