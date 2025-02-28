const logger = require('../logger');
const { validationResult } = require('express-validator');

const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const getClientIp = require('../util/clientip'); 
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

exports.createItem = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { Item_name,Item_alias,Item_Description,Item_Code,Non_Active, HospitalGroupIDR } = req.body;
  const hospitalDatabase = req.hospitalDatabase;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}

  try {
    const Item = require("../models/Item_Model")(req.sequelize);


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
      });
      return res.status(400).json({errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    await Item.sync();

    const item = await Item.create({
        Item_name,Item_alias,Item_Description,Item_Code,Non_Active, HospitalGroupIDR
    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "item created successfully", {
      executionTime,
      hospitalId: req.hospitalId,
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
      data: { item },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1269;

    logger.logWithMeta("error", "Error creating item", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating item: " + error.message },
    });
  }
};

exports.getItem = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { item_id } = req.query; // Get ledger_id from query params
  const hospitalDatabase = req.hospitalDatabase;

  try {
    // Load Sequelize models properly
    const ItemModel = require("../models/Item_Model");
    const Item = ItemModel(req.sequelize); // Initialize model with Sequelize instance

    if (item_id) {
      // Fetch single record by ID
      const item = await Item.findOne({ where: { item_id } });
      if (!accLedger) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1270;
    
        logger.logWithMeta("error", "Error fetching Item", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
        return res.status(404).json({errorCode, message: "Item not found" });
      }
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: accLedger,
      });
    } else {
      // Fetch all records
      const Items = await Item.findAll();
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: Items,
      });
    }
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1271;

    logger.logWithMeta("error", "Error fetching Item", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Item: " + error.message },
    });
  }
};
exports.getItemId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Item = require("../models/Item_Model")(req.sequelize);
    const item = await Item.findByPk(id);

    if (!item) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1272;
  
      logger.logWithMeta("error", "Item not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      return res.status(404).json({ errorCode,message: "Item not found" });
    }

    const executionTime = `${Date.now() - start}ms`;
    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      data: item,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1273;

    logger.logWithMeta("error", "Error retrieving Item", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    res.status(500).json({errorCode, message: "Error retrieving Item", error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Item = require("../models/Item_Model")(req.sequelize);
    const item = await Item.findByPk(id);

    if (!item) {
      const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1274;

    logger.logWithMeta("error", "Item not found", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
      return res.status(404).json({errorCode, message: "Item not found" });
    }

    await item.destroy();

    const executionTime = `${Date.now() - start}ms`;
    
    logger.logWithMeta("info", "Item deleted successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "Item deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1275;

    logger.logWithMeta("error", "Error deleting Item", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error deleting Item: " + error.message },
    });
  }
};
exports.updateItem = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const updateData = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
  try {
    const Item = require("../models/Item_Model")(req.sequelize);
    const item = await Item.findByPk(id);

    if (!item) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1276;
  
      logger.logWithMeta("error", "Item not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  

      return res.status(404).json({ message: "Item not found" });
    }

    await item.update(updateData);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Item updated successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1277;

    logger.logWithMeta("error", "Error updating Item", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error updating Item: " + error.message },
    });
  }
};

