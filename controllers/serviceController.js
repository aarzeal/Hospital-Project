// const { validationResult } = require("express-validator");
// const logger = require("../logger");
// const Service = require("../models/Service");
// const AccLedger = require("../models/AccLedger");
// const HospitalGroup = require("../models/HospitalGroup");
// const ServiceCategory = require("../models/servicecategory"); // Import service category model
// const getClientIp = require("../util/getclient"); // Import service category model
// const sequelize = require("../database/connection");
// const { Sequelize } = require("sequelize");




// exports.ensureSequelizeInstance = (req, res, next) => {
//   const start = Date.now();
//   // const clientIp = await getClientIp(req);

//   if (!req.hospitalDatabase) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 937;
//     const statusCode = 500;
//     // Log the warning
//     logger.logWithMeta("warn", `Database connection not established`, {
//       errorCode,
//       statusCode,
//       executionTime,
//       hospitalName: req.hospitalName,
//       // ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

//     return res.status(statusCode).json({
//       meta: {
//         statusCode: statusCode,
//         errorCode: 937,
//         executionTime: `${end - start}ms`,
//       },

//       error: {
//         message: "Database connection not established",
//       },
//     });
//   }

//   const sequelize = new Sequelize(
//     req.hospitalDatabase,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       dialect: process.env.DB_DIALECT,
//     }
//   );

//   req.sequelize = sequelize;
//   // logger.info('Sequelize instance created successfully');
//   const end = Date.now();
//   const executionTime = `${end - start}ms`;
//   // Log the warning
//   // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
//   //   executionTime,
//   //   statusCode: 200,
//   //   hospitalName: req.hospitalName,
//   //   // ip: clientIp,
//   //   apiName: req.originalUrl, // API name
//   //   method: req.method,
//   //   userAgent: req.headers["user-agent"], // HTTP method
//   // });
//   next();

//   sequelize
//     .sync({ alter: true })
//     .then(() => {
//       console.log("Database synchronized successfully.");
//     })
//     .catch((error) => {
//       console.error("Error synchronizing the database:", error);
//     });
// };


// exports.createService = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {

//     const end = Date.now();
//     // const executionTime = `${end - start}ms`;
//     const errorCode = 981;
//     const statusCode = 400;
//     logger.logWithMeta("warn", "Validation errors occurred", {
//       errors: errors.array(),
//       errorCode,
//       statusCode,
//       // executionTime,
//     });
//     return res.status(statusCode).json({
//       meta: { statusCode, errorCode, 
//         // executionTime 
//       },
//       error: {
//         message: "Validation errors occurred",
//         details: errors.array().map((err) => ({ field: err.param, message: err.msg })),
//       },
//     });
//   }

//   try {
//     const {
//       service_code,
//       service_name,
//       service_type,
//       service_category_IDR,
//       service_charge_applicable,
//       service_tax_applicable,
//       non_active,
//       ledger_id,
//       HospitalGroupID,
//     } = req.body;



//     if (service_category_IDR) {
//       const category = await ServiceCategory.findByPk(service_category_IDR);

//       if (!category) {

//          logger.logWithMeta("warn", `Service category not found.`, {
//                 errorCode :232,
//                 // executionTime,
//                 statusCode: 404,

//                 ip: clientIp,
//                 apiName: req.originalUrl,
//                 method: req.method,
//                 userAgent: req.headers['user-agent'],
//               });
//         throw new Error("Service category not found.");
//       }
//     }

//     if (ledger_id) {
//       const ledger = await AccLedger.findByPk(ledger_id);
//       if (!ledger) {

//         logger.logWithMeta("warn", `Ledger not found.`, {
//             errorCode :123,
//             // executionTime,
//             statusCode: 404,

//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers['user-agent'],
//           });
//         throw new Error("Ledger not found.");
//       }
//     }

//     if (HospitalGroupID) {
//       const hospitalGroup = await HospitalGroup.findByPk(HospitalGroupID);

//       if (!hospitalGroup) {
//         logger.logWithMeta("warn", `Hospital group not found`, {
//             errorCode:5465,
//             // executionTime,
//             statusCode: 404,

//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers['user-agent'],
//           });
//         throw new Error("Hospital group not found.");
//       }
//     }

//     const newService = await Service.create({
//       service_code,
//       service_name,
//       service_type,
//       service_category_IDR,
//       service_charge_applicable,
//       service_tax_applicable,
//       non_active,
//       ledger_id,
//       HospitalGroupID,
//     });

//     const end = Date.now();
//     // const executionTime = `${end - start}ms`;
//     logger.logWithMeta("info", "Service created successfully", {
//       // executionTime,
//       serviceId: newService.service_id,
//     });

//     res.status(200).json({
//       meta: { statusCode: 200,
//         //  executionTime
//          },
//       data: newService,

//     });
//   } catch (error) {
//     const end = Date.now();
//     // const executionTime = `${end - start}ms`;
//     const errorCode = 982;
//     const statusCode = 500;

//     logger.logWithMeta("error", "Error creating service", {
//       errorCode,
//       statusCode,
//       error: error.message,
//       // executionTime,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });
//     res.status(statusCode).json({
//       meta: { statusCode, errorCode,
//         //  executionTime
//          },
//       error: { message: `Error creating service: ${error.message}` },
//     });
//   }
// };


// exports.getAllAndGetById = async (req, res) => {
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
//     const { service_id } = req.query;

//     try {
//       let services;
//       if (service_id) {
//         // Fetch a single service by ID
//         services = await Service.findByPk(service_id, {
//           include: [
//             { model: ServiceCategory, as: "servicecategory" },
//             { model: AccLedger, as: "ledger" },
//             { model: HospitalGroup, as: "hospitalGroup" },
//           ],
//         });

//         if (!services) {
//           const errorCode = 984;
//           logger.logWithMeta("warn", "Service not found", {
//             errorCode,
//             executionTime: `${Date.now() - start}ms`,
//             statusCode: 404,
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//           });
//           return res.status(404).json({
//             meta: { statusCode: 404, errorCode, executionTime: `${Date.now() - start}ms` },
//             error: { message: "Service not found" },
//           });
//         }
//       } else {
//         // Fetch all services
//         services = await Service.findAll({
//           include: [
//             { model: ServiceCategory, as: "servicecategory" },
//             { model: AccLedger, as: "ledger" },
//             { model: HospitalGroup, as: "hospitalGroup" },
//           ],
//         });
//       }

//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       logger.logWithMeta("info", "Fetched service(s) successfully", {
//         executionTime,
//         count: service_id ? 1 : services.length,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//         meta: { statusCode: 200, executionTime },
//         data: services,
//       });
//     } catch (error) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 985;
//       const statusCode = 500;
//       logger.logWithMeta("error", "Error fetching service(s)", {
//         errorCode,
//         statusCode,
//         error: error.message,
//         executionTime,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });
//       res.status(statusCode).json({
//         meta: { statusCode, errorCode, executionTime },
//         error: { message: `Error fetching service(s): ${error.message}` },
//       });
//     }
//   };

//   exports.updateService = async (req, res) => {
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
//     const { service_id } = req.params; // Get service ID from request params
//     const updateData = req.body; // Data to update

//     try {
//       // Check if service exists
//       const service = await Service.findByPk(service_id);
//       if (!service) {
//         const errorCode = 986;
//         logger.logWithMeta("warn", "Service not found for update", {
//           errorCode,
//           executionTime: `${Date.now() - start}ms`,
//           statusCode: 404,
//           ip: clientIp,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//         });

//         return res.status(404).json({
//           meta: { statusCode: 404, errorCode, executionTime: `${Date.now() - start}ms` },
//           error: { message: "Service not found" },
//         });
//       }

//       // Update service
//       await service.update(updateData);

//       const executionTime = `${Date.now() - start}ms`;
//       logger.logWithMeta("info", "Service updated successfully", {
//         executionTime,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//         meta: { statusCode: 200, executionTime },
//         data: service,
//       });
//     } catch (error) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 987;
//       logger.logWithMeta("error", "Error updating service", {
//         errorCode,
//         error: error.message,
//         executionTime,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(500).json({
//         meta: { statusCode: 500, errorCode, executionTime },
//         error: { message: `Error updating service: ${error.message}` },
//       });
//     }
//   };

//   exports.deleteService = async (req, res) => {
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
//     const { service_id } = req.params; // Get service ID from request params

//     try {
//       // Check if service exists
//       const service = await Service.findByPk(service_id);
//       if (!service) {
//         const errorCode = 988;
//         logger.logWithMeta("warn", "Service not found for deletion", {
//           errorCode,
//           executionTime: `${Date.now() - start}ms`,
//           statusCode: 404,
//           ip: clientIp,
//           apiName: req.originalUrl,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//         });

//         return res.status(404).json({
//           meta: { statusCode: 404, errorCode, executionTime: `${Date.now() - start}ms` },
//           error: { message: "Service not found" },
//         });
//       }

//       // Delete service
//       await service.destroy();

//       const executionTime = `${Date.now() - start}ms`;
//       logger.logWithMeta("info", "Service deleted successfully", {
//         executionTime,
//         serviceId: service_id,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//         meta: { statusCode: 200, executionTime },
//         message: "Service deleted successfully",
//       });
//     } catch (error) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 989;
//       logger.logWithMeta("error", "Error deleting service", {
//         errorCode,
//         error: error.message,
//         executionTime,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(500).json({
//         meta: { statusCode: 500, errorCode, executionTime },
//         error: { message: `Error deleting service: ${error.message}` },
//       });
//     }
//   };


const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
// const Service_category = require("../models/HospitalGroup");

// const AccLedgermodel = require("../models/AccLedger"); 
dotenv.config();
async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 971 });
    //   clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}
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
    const start = Date.now();
    const clientIp = await getClientIp(req);
  console.log('Client IP:', clientIp);
    const logId = uuidv4();

    let locationData = { city: 'Unknown' };

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
    const start = Date.now();
    const clientIp = await getClientIp(req);
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
            // city: locationData?.city,
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
