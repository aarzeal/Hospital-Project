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
//       hospitalId: req.hospitalId,
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
//   //   hospitalId: req.hospitalId,
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

  
