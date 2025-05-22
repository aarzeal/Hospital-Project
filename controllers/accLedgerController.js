

const logger = require('../logger');
const { validationResult } = require('express-validator');

const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup"); 
const getLocationData = require('../util/locationHelper');
dotenv.config();
async function getClientIp(req) {
  // Get client IP from headers or request
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;

  // Check if the IP is a local or private network
  if (clientIp === '' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      // Fetch the public IP dynamically using ipify if it's local/private
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      // Log error if fetching the public IP fails
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1219 });

      // Fallback to localhost if API call fails
      clientIp = '127.0.0.1';
    }
  }

  return clientIp;
}
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
exports.createAccLedger = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { ledger_name,ledger_alias,ledger_cheque,maintain_bill_wise,isdiscount_ledger,remark,is_tax_aplicable,taxplan_IDR,creditperied, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}

  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);


    const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR} });

    // console.log("group0000000000",group)

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1268;
  
      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,  // Assign username from token
            updatedBy: req.username
      });
      return res.status(400).json({errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    await AccLedger.sync();

    // let updatedBy=null;
    
    const accLedger = await AccLedger.create({
      ledger_name,ledger_alias,ledger_cheque,maintain_bill_wise,isdiscount_ledger,remark,is_tax_aplicable,taxplan_IDR,creditperied,
        HospitalGroupIDR,
        createdBy: req.username,  // Assign username from token
        // updatedAt: null,
    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "accLedger created successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { accLedger },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1269;

    logger.logWithMeta("error", "Error creating accLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating accLedger: " + error.message },
    });
  }
};
exports.getAccLedger = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { ledger_id } = req.query; // Get ledger_id from query params
  const hospitalDatabase = req.hospitalDatabase;

  try {
    // Load Sequelize models properly
    const AccLedgerModel = require("../models/AccLedger");
    const AccLedger = AccLedgerModel(req.sequelize); // Initialize model with Sequelize instance

    if (ledger_id) {
      // Fetch single record by ID
      const accLedger = await AccLedger.findOne({ where: { ledger_id } });
      if (!accLedger) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1270;
    
        logger.logWithMeta("error", "Error fetching AccLedger", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });
        return res.status(404).json({errorCode, message: "AccLedger not found" });
      }
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: accLedger,
      });
    } else {
      // Fetch all records
      const accLedgers = await AccLedger.findAll();
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: accLedgers,
      });
    }
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1271;

    logger.logWithMeta("error", "Error fetching AccLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching AccLedger: " + error.message },
    });
  }
};

exports.getaccledgerasperqueryparams=async(req, res)=>{
   const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);
    const { ledger_id, page, limit, ...queryColumns } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let attributes = Object.keys(queryColumns);
    if (!attributes.includes("ledger_id")) {
      attributes.push("ledger_id");
    }

    if (attributes.length === 1 && attributes[0] === "ledger_id") {
      attributes = undefined;
    }
    let data, totalRecords;
    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter(
      (key) => key !== "page" && key !== "limit"
    );

    if (ledger_id) {
      data = await AccLedger.findOne({
        where: { ledger_id },
        attributes,
      });
      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 2123;
        logger.logWithMeta("error", "AccLedger not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });
        return res
          .status(404)
          .json({ errorCode, message: "AccLedger Not Found" });
      }
    } else{
      const isPagination=req.query.page && req.query.limit;
      if(filterKeys.length===0){
        if(isPagination){
          totalRecords=await AccLedger.count();
          data= await AccLedger.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['ledger_id','ASC']],
          });
        }else{
          data=await AccLedger.findAll({
            attributes,
            order:[['ledger_id','ASC']],
          });
          totalRecords=data.length;
        }
      }else{
         if(isPagination){
          totalRecords=await AccLedger.count();
          data= await AccLedger.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['ledger_id','ASC']],
          });
        }else{
          data=await AccLedger.findAll({
            attributes,
            order:[['ledger_id','ASC']],
          });
          totalRecords=data.length;
        }
      }
    }
const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched AccLedger Successfully",{
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    const formatData = (record) => {
      const obj = record.toJSON();
      const { ledger_id, ...rest } = obj;
      return {ledger_id, ...rest };
    };

    const formattedData = Array.isArray(data)
      ? data.map(formatData)
      : data
      ? formatData(data)
      : null;

    const meta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (!ledger_id && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }

    res.status(200).json({
      meta,
      data: formattedData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching AccLedger data", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching AccLedger: " + error.message },
    });
  }
};
exports.getAccLedgerById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);
    const accLedger = await AccLedger.findByPk(id);

    if (!accLedger) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1272;
  
      logger.logWithMeta("error", "AccLedger not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,  // Assign username from token
            updatedBy: req.username
      });
      return res.status(404).json({ errorCode,message: "AccLedger not found" });
    }

    const executionTime = `${Date.now() - start}ms`;
    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      data: accLedger,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1273;

    logger.logWithMeta("error", "Error retrieving AccLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });
    res.status(500).json({errorCode, message: "Error retrieving AccLedger", error: error.message });
  }
};

exports.deleteAccLedger = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);
    const accLedger = await AccLedger.findByPk(id);

    if (!accLedger) {
      const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1274;

    logger.logWithMeta("error", "AccLedger not found", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });
      return res.status(404).json({errorCode, message: "AccLedger not found" });
    }

    await accLedger.destroy();

    const executionTime = `${Date.now() - start}ms`;
    
    logger.logWithMeta("info", "AccLedger deleted successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "AccLedger deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1275;

    logger.logWithMeta("error", "Error deleting AccLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error deleting AccLedger: " + error.message },
    });
  }
};
exports.updateAccLedger = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const updateData = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);
    const accLedger = await AccLedger.findByPk(id);

    if (!accLedger) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1276;
  
      logger.logWithMeta("error", "AccLedger not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,  // Assign username from token
            updatedBy: req.username
      });
  

      return res.status(404).json({ message: "AccLedger not found" });
    }

    // await accLedger.update(updateData);
     // ✅ Ensure updatedAt is explicitly set when updating
     await accLedger.update({
      ...updateData,
      updatedBy: req.username, // Track who updated it
      updatedAt: new Date(), // ✅ Manually set updatedAt
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "AccLedger updated successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "AccLedger updated successfully",
      data: accLedger,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1277;

    logger.logWithMeta("error", "Error updating AccLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,  // Assign username from token
            updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error updating AccLedger: " + error.message },
    });
  }
};





