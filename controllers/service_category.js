const Module = require("../models/masterModule");
const logger = require('../logger');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const redisClient=require("../controllers/rediClient")

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const { validationResult } = require('express-validator');
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
//       logging: false,
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




exports.createServiceCategory = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryname, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }


  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);
    await ServiceCategory.sync({ force: false });

    const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    const serviceCategory = await ServiceCategory.create({
      servicecategoryname,
      HospitalGroupIDR,
      createdBy: req.username,

    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Service category created successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { serviceCategory },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1261;

    logger.logWithMeta("error", "Error creating service category", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating service category: " + error.message },
    });
  }
};

exports.getServiceCategories = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryId } = req.query;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);

    let data;
    if (servicecategoryId) {
      data = await ServiceCategory.findOne({ where: { servicecategoryId } });
      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1262;

        logger.logWithMeta("error", "Service category not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username
        });

        return res.status(404).json({ errorCode, message: "Service category not found" });
      }
    } else {
      data = await ServiceCategory.findAll();
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched service categories successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching service categories", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching service categories: " + error.message },
    });
  }
};


exports.updateServiceCategory = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryId } = req.params;
  const { servicecategoryname, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);

    let serviceCategory = await ServiceCategory.findOne({ where: { servicecategoryId } });
    if (!serviceCategory) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1264;

      logger.logWithMeta("error", "Service category not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(404).json({ errorCode, message: "Service category not found" });
    }

    serviceCategory.servicecategoryname = servicecategoryname;
    serviceCategory.HospitalGroupIDR = HospitalGroupIDR;
    // await serviceCategory.save();

    await serviceCategory.update({
      servicecategoryname,
      HospitalGroupIDR,
      updatedBy: req.username,  // Track who updated it
      updatedAt: new Date(),    // ✅ Manually update timestamp
    });


    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Updated service category successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: serviceCategory,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1265;

    logger.logWithMeta("error", "Error updating service category", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating service category: " + error.message },
    });
  }
};

exports.deleteServiceCategory = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { servicecategoryId } = req.params;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);
    await ServiceCategory.sync();

    const serviceCategory = await ServiceCategory.findOne({ where: { servicecategoryId } });

    if (!serviceCategory) {

      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1266;

      logger.logWithMeta("error", "Service category not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });

      return res.status(404).json({ errorCode, message: "Service category not found" });
    }

    await serviceCategory.destroy();

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Service category deleted successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      message: "Service category deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1267;

    logger.logWithMeta("error", "Error deleting service category", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error deleting service category: " + error.message },
    });
  }
};

// exports.getServiceReportsssssss = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);

//   try {
//     const { startDate, endDate, page = 1, limit = 50 } = req.query;
//     const offset = (page - 1) * limit;

//     const Service = require("../models/ser")(req.sequelize);
//     const ServiceCategory = require("../models/servicecategory")(req.sequelize);
//     const ServiceSOR = require("../models/ServiceSOR")(req.sequelize);
//     const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
//     const BillingClass = require("../models/Billing_Class")(req.sequelize);

//     // Associations
//     Service.belongsTo(ServiceCategory, { foreignKey: "service_category_IDR", as: "category" });
//     Service.hasMany(Service_Price_List, { foreignKey: "service_IDR", as: "priceList" });
//     Service.hasMany(ServiceSOR, { foreignKey: "serviceIDR", as: "sors" });
//     ServiceSOR.belongsTo(BillingClass, { foreignKey: "classIDR", as: "billingClass" });

//     // Filter only on Service createdAt
//     const serviceDateFilter = {};
//     if (startDate) serviceDateFilter[Op.gte] = new Date(startDate);
//     if (endDate) serviceDateFilter[Op.lte] = new Date(endDate);

//     const services = await Service.findAll({
//       where: Object.keys(serviceDateFilter).length ? { createdAt: serviceDateFilter } : undefined,
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       include: [
//         { model: ServiceCategory, as: "category" },
//         { model: Service_Price_List, as: "priceList" },
//         {
//           model: ServiceSOR,
//           as: "sors",
//           include: [{ model: BillingClass, as: "billingClass" }]
//         }
//       ],
//       order: [["createdAt", "DESC"]]
//     });

//     const executionTime = `${Date.now() - start}ms`;

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//         page: parseInt(page),
//         limit: parseInt(limit)
//       },
//       data: services
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9056;

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode,
//         executionTime,
//         hospitalDatabase
//       },
//       error: {
//         message: `Error fetching Service Report: ${error.message}`
//       }
//     });
//   }
// };
// // ----------------------------------




// exports.getServiceReport = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);

//   try {
//     const {
//       startDate,
//       endDate,
//       categoryIds,
//       classIds,
//       active,
//       serviceIds,
//       serviceType,
//       search,
//       financialYear,
//       page = 1,
//       limit = 10,
//     } = req.query;

//         const cacheKey = `serviceReport:${JSON.stringify(req.query)}`;
//     const cachedData = await redisClient.get(cacheKey);
//     if (cachedData) {
//       console.log("🔹 Cache HIT");
//       return res.json(JSON.parse(cachedData));
//     }
//     console.log("🔹 Cache MISS");

//     const Service = require("../models/ser")(req.sequelize);
//     const ServiceCategory = require("../models/servicecategory")(req.sequelize);
//     const ServiceSOR = require("../models/ServiceSOR")(req.sequelize);
//     const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
//     const BillingClass = require("../models/Billing_Class")(req.sequelize);

//     // Associations
//     Service.belongsTo(ServiceCategory, { foreignKey: "service_category_IDR", as: "category" });
//     Service.hasMany(Service_Price_List, { foreignKey: "service_IDR", as: "priceList" });
//     Service.hasMany(ServiceSOR, { foreignKey: "serviceIDR", as: "sors" });
//     ServiceSOR.belongsTo(BillingClass, { foreignKey: "classIDR", as: "billingClass" });

//     // Filters
//     const whereService = {};
//     const whereSOR = {};

//     if (serviceIds) whereService.service_id = { [Op.in]: serviceIds.split(",") };
//     if (serviceType) whereService.service_type = serviceType;
//     if (active !== undefined) whereService.non_active = active === "true" ? false : true;
//     if (categoryIds) whereService.service_category_IDR = { [Op.in]: categoryIds.split(",") };
//     if (search) whereService.service_name = { [Op.like]: `%${search}%` };
//     if (classIds) whereSOR.classIDR = { [Op.in]: classIds.split(",") };

//     // ✅ Priority Logic for Date and Financial Year
//     // if (startDate && endDate) {
//     //   // User selected custom date range
//     //   whereSOR.fromDate = { [Op.gte]: new Date(startDate) };
//     //   whereSOR.toDate = { [Op.lte]: new Date(endDate) };
//     // } else if (financialYear) {
//     //   // Default financial year logic (Apr 1 - Mar 31)
//     //   const currentYear = new Date().getFullYear();
//     //   const currentMonth = new Date().getMonth() + 1;
//     //   let fyStart, fyEnd;

//     //   if (currentMonth >= 4) {
//     //     fyStart = new Date(currentYear, 3, 1); // Apr 1 current year
//     //     fyEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59); // Mar 31 next year
//     //   } else {
//     //     fyStart = new Date(currentYear - 1, 3, 1); // Apr 1 previous year
//     //     fyEnd = new Date(currentYear, 2, 31, 23, 59, 59); // Mar 31 current year
//     //   }

//     //   whereSOR.fromDate = { [Op.gte]: fyStart };
//     //   whereSOR.toDate = { [Op.lte]: fyEnd };
//     // }
    
//     // Date & Financial Year logic
// if (startDate && endDate) {
//   // User provided custom date range → financial year logic ignore
//   whereSOR.fromDate = { [Op.gte]: new Date(startDate) };
//   whereSOR.toDate = { [Op.lte]: new Date(endDate) };
// } else if (financialYear || (!startDate && !endDate)) {
//   // Default financial year applied only if startDate/endDate missing
//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = today.getMonth() + 1;
//   let fyStart, fyEnd;

//   if (currentMonth >= 4) {
//     fyStart = new Date(currentYear, 3, 1); // Apr 1 current year
//     fyEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59); // Mar 31 next year
//   } else {
//     fyStart = new Date(currentYear - 1, 3, 1); // Apr 1 previous year
//     fyEnd = new Date(currentYear, 2, 31, 23, 59, 59); // Mar 31 current year
//   }
//  if (!classIds && !serviceIds && !categoryIds) {
//   whereSOR.fromDate = { [Op.gte]: fyStart };
//   whereSOR.toDate = { [Op.lte]: fyEnd };
// }
// }
// // Baaki filters jaise classIds, categoryIds, serviceIds, search etc. unaffected


//     // Fetch services with associations
//     const services = await Service.findAndCountAll({
//       where: whereService,
//       include: [
//         { model: ServiceCategory, as: "category" },
//         {
//           model: Service_Price_List,
//           as: "priceList",
//           limit: 10, // first 10 priceList items per service
//         },
//         {
//           model: ServiceSOR,
//           as: "sors",
//           where: Object.keys(whereSOR).length ? whereSOR : undefined,
//           required: true, // ✅ only records matching date/class filter will be returned
//           include: [{ model: BillingClass, as: "billingClass" }],
//         },
//       ],
//       offset: (page - 1) * limit,
//       limit: parseInt(limit),
//       distinct: true,
//     });

//     const executionTime = `${Date.now() - start}ms`;

//     // res.status(200).json({
//     //   meta: {
//     //     statusCode: 200,
//     //     executionTime,
//     //     hospitalDatabase,
//     //     locationData,
//     //   },
//     //   filters: req.query,
//     //   pagination: {
//     //     page: parseInt(page),
//     //     limit: parseInt(limit),
//     //     totalRecords: services.count,
//     //     totalPages: Math.ceil(services.count / limit),
//     //   },
//     //   masterDetail: services.rows, // ✅ agar koi record nahi hoga to [] return hoga
//     // });

//         const responseData = {
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//         locationData,
//       },
//       filters: req.query,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalRecords: services.count,
//         totalPages: Math.ceil(services.count / limit),
//       },
//       masterDetail: services.rows,
//     };

//     // ✅ Redis cache 5 min
//     await redisClient
//       .set(cacheKey, JSON.stringify(responseData), "EX", 300)
//       .catch(err => console.error("Redis set error:", err));

//     res.json(responseData);
    
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9056;

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode,
//         executionTime,
//         hospitalDatabase,
//       },
//       error: {
//         message: `Error fetching Service Report: ${error.message}`,
//       },
//     });
//   }
// };

exports.getServiceReport = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const {
      startDate,
      endDate,
      categoryIds,
      classIds,
      active,
      serviceIds,
      serviceType,
      search,
      financialYear,
      skipDateFilter,
      page = 1,
      limit = 10,
    } = req.query;

    const cacheKey = `serviceReport:${JSON.stringify(req.query)}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("🔹 Cache HIT");
      return res.json(JSON.parse(cachedData));
    }
    console.log("🔹 Cache MISS");

    const Service = require("../models/ser")(req.sequelize);
    const ServiceCategory = require("../models/servicecategory")(req.sequelize);
    const ServiceSOR = require("../models/ServiceSOR")(req.sequelize);
    const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
    const BillingClass = require("../models/Billing_Class")(req.sequelize);

    // Associations
    Service.belongsTo(ServiceCategory, { foreignKey: "service_category_IDR", as: "category" });
    Service.hasMany(Service_Price_List, { foreignKey: "service_IDR", as: "priceList" });
    Service.hasMany(ServiceSOR, { foreignKey: "serviceIDR", as: "sors" });
    ServiceSOR.belongsTo(BillingClass, { foreignKey: "classIDR", as: "billingClass" });

    // Filters
    const whereService = {};
    const whereSOR = {};

    // Service filters
    if (serviceIds) whereService.service_id = { [Op.in]: serviceIds.split(",") };
    if (serviceType) whereService.service_type = serviceType;
    if (categoryIds) whereService.service_category_IDR = { [Op.in]: categoryIds.split(",") };
    if (search) whereService.service_name = { [Op.like]: `%${search}%` };
    if (classIds) whereSOR.classIDR = { [Op.in]: classIds.split(",") };

    // Active filter applied to ServiceSOR only
    if (active !== undefined) {
      const isActive = active.trim() === "true";
      whereSOR.non_active = !isActive; // true -> non_active=false, false -> non_active=true
    }

    // Date & Financial Year logic
    // if (startDate && endDate) {
    //   // Custom date range provided → ignore financial year
    //   whereSOR.fromDate = { [Op.gte]: new Date(startDate) };
    //   whereSOR.toDate = { [Op.lte]: new Date(endDate) };
    // } else if ((!startDate && !endDate) && (active === undefined || active === null) || financialYear) {
    //   // Apply default financial year only if start/end date not provided AND active filter not specified
    //   const today = new Date();
    //   const currentYear = today.getFullYear();
    //   const currentMonth = today.getMonth() + 1;
    //   let fyStart, fyEnd;

    //   if (currentMonth >= 4) {
    //     fyStart = new Date(currentYear, 3, 1); // Apr 1 current year
    //     fyEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59); // Mar 31 next year
    //   } else {
    //     fyStart = new Date(currentYear - 1, 3, 1); // Apr 1 previous year
    //     fyEnd = new Date(currentYear, 2, 31, 23, 59, 59); // Mar 31 current year
    //   }

    //   // Only apply FY filter if no other filters provided
    //   if (!classIds && !serviceIds && !categoryIds) {
    //     whereSOR.fromDate = { [Op.gte]: fyStart };
    //     whereSOR.toDate = { [Op.lte]: fyEnd };
    //   }
    // }

    if (!skipDateFilter) { // Only apply date filters if not skipped
  if (startDate && endDate) {
    whereSOR.fromDate = { [Op.gte]: new Date(startDate) };
    whereSOR.toDate = { [Op.lte]: new Date(endDate) };
  } else if ((!startDate && !endDate) && (active === undefined || active === null) || financialYear) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    let fyStart, fyEnd;

    if (currentMonth >= 4) {
      fyStart = new Date(currentYear, 3, 1);
      fyEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59);
    } else {
      fyStart = new Date(currentYear - 1, 3, 1);
      fyEnd = new Date(currentYear, 2, 31, 23, 59, 59);
    }

    if (!classIds && !serviceIds && !categoryIds) {
      whereSOR.fromDate = { [Op.gte]: fyStart };
      whereSOR.toDate = { [Op.lte]: fyEnd };
    }
  }
}

    // Fetch services with associations
    const services = await Service.findAndCountAll({
      where: whereService,
      include: [
        { model: ServiceCategory, as: "category" },
        {
          model: Service_Price_List,
          as: "priceList",
          limit: 10,
        },
        {
          model: ServiceSOR,
          as: "sors",
          where: Object.keys(whereSOR).length ? whereSOR : undefined,
          required: true, // Only services with matching SOR records
          include: [{ model: BillingClass, as: "billingClass" }],
        },
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      distinct: true,
    });

    const executionTime = `${Date.now() - start}ms`;

    const responseData = {
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
        locationData,
      },
      filters: req.query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords: services.count,
        totalPages: Math.ceil(services.count / limit),
      },
      masterDetail: services.rows,
    };

    // Redis cache 5 min
    await redisClient
      .set(cacheKey, JSON.stringify(responseData), "EX", 300)
      .catch(err => console.error("Redis set error:", err));

    res.json(responseData);

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9056;

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: `Error fetching Service Report: ${error.message}`,
      },
    });
  }
};


