// const AccLedger = require("../models/AccLedger");
// const HospitalGroup = require("../models/HospitalGroup");

// // Create a new ledger
// const createLedger = async (req, res) => {
//   try {
//     const {
//       ledger_name,
//       ledger_alias,
//       ledger_cheque,
//       maintain_bill_wise,
//       isdiscount_ledger,
//       remark,
//       is_tax_aplicable,
//       taxplan_IDR,
//       creditperied,
//       hospital_group_IDR,
//     } = req.body;

//     // Validate required fields
//     if (!ledger_name) {
//       return res.status(400).json({ success: false, message: "Ledger name is required." });
//     }

//     // Check if hospital group exists if hospital_group_IDR is provided
//     if (hospital_group_IDR) {
//       const hospitalGroup = await HospitalGroup.findByPk(hospital_group_IDR);
//       if (!hospitalGroup) {
//         return res.status(404).json({ success: false, message: "Hospital group not found." });
//       }
//     }

//     // Create ledger entry
//     const newLedger = await AccLedger.create({
//       ledger_name,
//       ledger_alias,
//       ledger_cheque,
//       maintain_bill_wise,
//       isdiscount_ledger,
//       remark,
//       is_tax_aplicable,
//       taxplan_IDR,
//       creditperied,
//       hospital_group_IDR,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Ledger created successfully",
//       data: newLedger,
//     });
//   } catch (error) {
//     console.error("Error creating ledger:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//   }
// };

// module.exports = { createLedger };


const logger = require('../logger');

const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup"); 
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
exports.ensureSequelizeInstance = (req, res, next) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);

  if (!req.hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 937;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Database connection not established`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 937,
        executionTime: `${end - start}ms`,
      },

      error: {
        message: "Database connection not established",
      },
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: false,
    }
  );

  req.sequelize = sequelize;
  // logger.info('Sequelize instance created successfully');
  const end = Date.now();
  const executionTime = `${end - start}ms`;
  // Log the warning
  // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
  //   executionTime,
  //   statusCode: 200,
  //   hospitalId: req.hospitalId,
  //   // ip: clientIp,
  //   apiName: req.originalUrl, // API name
  //   method: req.method,
  //   userAgent: req.headers["user-agent"], // HTTP method
  // });
  
  next();

  sequelize
    .sync({ alter: true })
    
    .then(() => {
      console.log("Database synchronized successfully.");
    })
    
    .catch((error) => {
      console.error("Error synchronizing the database:", error);
    });
};
exports.createAccLedger = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { ledger_name,ledger_alias,ledger_cheque,maintain_bill_wise,isdiscount_ledger,remark,is_tax_aplicable,taxplan_IDR,creditperied, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    const AccLedger = require("../models/AccLedger")(req.sequelize);


    const group = await Group.findOne({ where: { HospitalGroupID: HospitalGroupIDR} });

    console.log("group0000000000",group)

    if (!group) {
      return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    await AccLedger.sync();

    const accLedger = await AccLedger.create({
      ledger_name,ledger_alias,ledger_cheque,maintain_bill_wise,isdiscount_ledger,remark,is_tax_aplicable,taxplan_IDR,creditperied,
        HospitalGroupIDR,
    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "accLedger created successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
      },
      data: { accLedger },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 939;

    logger.logWithMeta("error", "Error creating accLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
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
        return res.status(404).json({ message: "AccLedger not found" });
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
    const errorCode = 940;

    logger.logWithMeta("error", "Error fetching AccLedger", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching AccLedger: " + error.message },
    });
  }
};

