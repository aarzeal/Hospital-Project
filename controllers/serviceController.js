

const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const getClientIp = require('../util/clientip');
const { validationResult } = require('express-validator');
// const Service_category = require("../models/HospitalGroup");

// const AccLedgermodel = require("../models/AccLedger"); 
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
  console.log('Client IP:', clientIp);

    const logId = uuidv4();

    let locationData = { city: 'Unknown' };

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

     try {
       const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
       locationData = locationResponse.data;
       console.log('Location Data:', locationData);
     } catch (error) {
       logger.error('Error fetching location data', { error: error.message });
     }


    const { service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Service = require("../models/ser")(req.sequelize);
        


        const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });


        // console.log("group0000000000", group)


        if (!group) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1278;
    
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
            });
            return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
        }



        const Service_category = require("../models/servicecategory")(req.sequelize);

        const service_category = await Service_category.findOne({
            where: { servicecategoryId: service_category_IDR }
        });

        if (!service_category) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1279;
    
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
            });
            return res.status(400).json({errorCode, message: "Invalid Service Category ID, not found in MasterDB" });
        }


        const AccLedger = require("../models/AccLedger")(req.sequelize);

        const accLedger = await AccLedger.findOne({
            where: { ledger_id: ledger_IDR }
        });

        if (!accLedger) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1280;
    
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
            });

            return res.status(400).json({ message: "Invalid ledger_IDR, not found in MasterDB" });
        }





        await Service.sync();

        const service = await Service.create({
            service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR
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
        const errorCode = 1281;

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

    let locationData = { city: 'Unknown' };

    try {
      const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
      locationData = locationResponse.data;
      console.log('Location Data:', locationData);
    } catch (error) {
      logger.error('Error fetching location data', { error: error.message });
    }

    const { id } = req.params;  // If an ID is provided, it will fetch by ID; otherwise, it fetches all
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Service = require("../models/ser")(req.sequelize);

        let response;
        if (id) {
            response = await Service.findOne({ where: { service_id: id } });
            if (!response) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 1282;
        
                logger.logWithMeta("error", `Service not found"}`, {
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
                return res.status(404).json({errorCode, message: "Service not found" });
            }
        } else {
            response = await Service.findAll();
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", `Fetched ${id ? "service by ID" : "all services"} successfully`, {
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
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: response,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1282;

        logger.logWithMeta("error", `Error fetching ${id ? "service by ID" : "all services"}`, {
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

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: `Error fetching ${id ? "service by ID" : "services"}: ` + error.message },
        });
    }
};
exports.updateService = async (req, res) => {
  
  const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    let locationData = { city: 'Unknown' };

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

    try {
      const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
      locationData = locationResponse.data;
      console.log('Location Data:', locationData);
    } catch (error) {
      logger.error('Error fetching location data', { error: error.message });
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
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
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
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });
    
            return res.status(400).json({ errorCode,message: "Invalid Service Category ID, not found in MasterDB" });
        }

        // **UPDATE SERVICE**
        await service.update({ service_code, service_name, service_type, service_category_IDR, service_charge_applicable, service_tax_applicable, non_active, ledger_IDR, HospitalGroupIDR });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service updated successfully", {
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
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error updating service: " + error.message },
        });
    }
};
exports.deleteService = async (req, res) => {
    const start = Date.now();
    let locationData = { city: 'Unknown' };

    try {
      const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
      locationData = locationResponse.data;
      console.log('Location Data:', locationData);
    } catch (error) {
      logger.error('Error fetching location data', { error: error.message });
    }

    const clientIp = await getClientIp(req);
    const { service_id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Service = require("../models/ser")(req.sequelize);
        await Service.sync();

        const service = await Service.findOne({ where: { service_id } });
        
        if (!service) {
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
    
            return res.status(404).json({errorCode, message: "Service not found" });
        }

        await service.destroy();
        
        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service deleted successfully", {
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
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            message: "Service deleted successfully",
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1287;

        logger.logWithMeta("error", "Error deleting service", {
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

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error deleting service: " + error.message },
        });
    }
};
