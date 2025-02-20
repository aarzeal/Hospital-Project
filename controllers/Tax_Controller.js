const logger = require('../logger');

const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalModel"); 
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
exports.createTax = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { tax_name,tax_rate,is_active,HospitalIDR,} = req.body;
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      const Tax = require("../models/Tax_Model")(req.sequelize);
  
  
      const group = await Group.findOne({ where: { HospitalID: HospitalIDR} });
  
      // console.log("group0000000000",group)
  
      if (!group) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1268;
    
        logger.logWithMeta("error", "Invalid HospitalID, not found in hospitaltable", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
        return res.status(400).json({errorCode, message: "Invalid HospitalID, not found in hospitaltable" });
      }
  
      await Tax.sync();
  
      const tax = await Tax.create({
        tax_name,tax_rate,is_active,HospitalIDR
      });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Tax created successfully", {
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
        data: { Tax },
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1269;
  
      logger.logWithMeta("error", "Error creating Tax", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
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
    const { tax_id } = req.query; // Get ledger_id from query params
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      // Load Sequelize models properly
      const taxModel = require("../models/Tax_Model");
      const Tax = taxModel(req.sequelize); // Initialize model with Sequelize instance
  
      if (tax_id) {
        // Fetch single record by ID
        const tax = await Tax.findOne({ where: { tax_id } });
        if (!tax) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 1270;
      
          logger.logWithMeta("error", "Error fetching Tax", {
            errorCode,
            executionTime,
            hospitalId: req.hospitalId,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
          });
          return res.status(404).json({errorCode, message: "Tax not found" });
        }
        return res.status(200).json({
          meta: { statusCode: 200, hospitalDatabase },
          data: tax,
        });
      } else {
        // Fetch all records
        const tax = await Tax.findAll();
        return res.status(200).json({
          meta: { statusCode: 200, hospitalDatabase },
          data: tax,
        });
      }
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1271;
  
      logger.logWithMeta("error", "Error fetching Tax", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error fetching Tax: " + error.message },
      });
    }
  };
  exports.getTaxById = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
  
    try {
      const Tax = require("../models/Tax_Model")(req.sequelize);
      const tax = await Tax.findByPk(id);
  
      if (!tax) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1272;
    
        logger.logWithMeta("error", "Tax not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
        return res.status(404).json({ errorCode,message: "Tax not found" });
      }
  
      const executionTime = `${Date.now() - start}ms`;
      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        data: tax,
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1273;
  
      logger.logWithMeta("error", "Error retrieving Tax", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      res.status(500).json({errorCode, message: "Error retrieving Tax", error: error.message });
    }
  };
  exports.updateTax = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      const tax = require("../models/Tax_Model")(req.sequelize);
      const Tax = await tax.findByPk(id);
  
      if (!Tax) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1276;
    
        logger.logWithMeta("error", "tax not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
    
  
        return res.status(404).json({ message: "tax not found" });
      }
  
      await Tax.update(updateData);
  
      const executionTime = `${Date.now() - start}ms`;
      logger.logWithMeta("info", "tax updated successfully", {
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        message: "tax updated successfully",
        data: Tax,
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1277;
  
      logger.logWithMeta("error", "Error updating tax", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime },
        error: { message: "Error updating tax: " + error.message },
      });
    }
  };
  exports.deletetax = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
  
    try {
      const tax = require("../models/Tax_Model")(req.sequelize);
      const Tax = await tax.findByPk(id);
  
      if (!Tax) {
        const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1274;
  
      logger.logWithMeta("error", "tax not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
        return res.status(404).json({errorCode, message: "tax not found" });
      }
  
      await Tax.destroy();
  
      const executionTime = `${Date.now() - start}ms`;
      
      logger.logWithMeta("info", "tax deleted successfully", {
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        message: "tax deleted successfully",
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1275;
  
      logger.logWithMeta("error", "Error deleting tax", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime },
        error: { message: "Error deleting tax: " + error.message },
      });
    }
  };
  
