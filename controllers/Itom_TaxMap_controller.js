const logger = require('../logger');

const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
// const Group = require("../models/AccLedger"); 
// const tax = require("../models/Tax_Model"); 
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
exports.createTaxDetails = async (req, res) => {
    const start = Date.now();
    let locationData = { city: 'Unknown' };
    const clientIp = await getClientIp(req);
    const { Itom_IDR, Tax_Plan_IDR, Hospital_IDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      // Ensure dynamic initialization of models
      const Tax_Details = require("../models/Itom_TaxMap_model")(req.sequelize, Sequelize.DataTypes);
      const Group = require("../models/AccLedger")(req.sequelize, Sequelize.DataTypes);
      const Tax = require("../models/Tax_Model")(req.sequelize, Sequelize.DataTypes);
      const Hospital = require("../models/HospitalModel")(req.sequelize, Sequelize.DataTypes);
  
      // Validate Itom_IDR in AccLedger
      const group = await Group.findOne({ where: { Itom_ID: Itom_IDR } });
      if (!group) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1286;
  
        logger.logWithMeta("error", "Itom_ID not found in AccLedger", {
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
  
        return res.status(400).json({ errorCode, message: "Invalid Itom_IDR, not found in AccLedger table" });
      }
  
      // Validate Tax_Plan_IDR in Tax_Model
      const taxData = await Tax.findOne({ where: { Tax_Plan_ID: Tax_Plan_IDR } });
      if (!taxData) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1287;
  
        logger.logWithMeta("error", "Tax_Plan_ID not found in Tax_Model", {
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
  
        return res.status(400).json({ errorCode, message: "Invalid Tax_Plan_IDR, not found in Tax_Model table" });
      }
  
      // Validate Hospital_IDR in HospitalModel
      const hospital = await Hospital.findOne({ where: { Hospital_ID: Hospital_IDR } });
      if (!hospital) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1288;
  
        logger.logWithMeta("error", "Hospital_ID not found in HospitalModel", {
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
  
        return res.status(400).json({ errorCode, message: "Invalid Hospital_IDR, not found in HospitalModel table" });
      }
  
      // Create Tax Details
      await Tax_Details.sync();
      const tax_details = await Tax_Details.create({
        Itom_IDR,
        Tax_Plan_IDR,
        Hospital_IDR
      });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Tax Details Created Successfully", {
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
          message: "Tax Details Created Successfully",
          statusCode: 200,
          executionTime,
          hospitalDatabase,
        },
        data: tax_details,
      });
  
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("error", "Error creating Tax Details", {
        errorCode: 1290,
        executionTime,
        hospitalName: req.hospitalName,
        ip: clientIp,
        error: error.message,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, executionTime, hospitalDatabase },
        error: { message: "Error creating Tax Details: " + error.message },
      });
    }
  }

  exports.getAllTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      const Tax_Details = require("../models/Itom_TaxMap_model")(req.sequelize, Sequelize.DataTypes);
      
      const taxDetails = await Tax_Details.findAll();
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Fetched all Tax Details successfully", {
        executionTime,
        hospitalDatabase,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { message: "Fetched all Tax Details successfully", statusCode: 200, executionTime },
        data: taxDetails,
      });
  
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("error", "Error fetching Tax Details", {
        executionTime,
        error: error.message,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(500).json({
        meta: { statusCode: 500, executionTime, hospitalDatabase },
        error: { message: "Error fetching Tax Details: " + error.message },
      });
    }
  };

  exports.updateTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
    const { Itom_IDR, Tax_Plan_IDR, Hospital_IDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      const Tax_Details = require("../models/Itom_TaxMap_model")(req.sequelize, Sequelize.DataTypes);
  
      const taxDetail = await Tax_Details.findByPk(id);
      if (!taxDetail) {
        return res.status(404).json({ message: "Tax Details not found" });
      }
  
      await taxDetail.update({ Itom_IDR, Tax_Plan_IDR, Hospital_IDR });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Updated Tax Details successfully", {
        executionTime,
        hospitalDatabase,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { message: "Tax Details updated successfully", statusCode: 200, executionTime },
        data: taxDetail,
      });
  
    } catch (error) {
      res.status(500).json({
        meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
        error: { message: "Error updating Tax Details: " + error.message },
      });
    }
  };

  exports.updateTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
    const { Itom_IDR, Tax_Plan_IDR, Hospital_IDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      const Tax_Details = require("../models/Itom_TaxMap_model")(req.sequelize, Sequelize.DataTypes);
  
      const taxDetail = await Tax_Details.findByPk(id);
      if (!taxDetail) {
        return res.status(404).json({ message: "Tax Details not found" });
      }
  
      await taxDetail.update({ Itom_IDR, Tax_Plan_IDR, Hospital_IDR });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Updated Tax Details successfully", {
        executionTime,
        hospitalDatabase,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { message: "Tax Details updated successfully", statusCode: 200, executionTime },
        data: taxDetail,
      });
  
    } catch (error) {
      res.status(500).json({
        meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
        error: { message: "Error updating Tax Details: " + error.message },
      });
    }
  };

  exports.deleteTaxDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;
  
    try {
      const Tax_Details = require("../models/Itom_TaxMap_model")(req.sequelize, Sequelize.DataTypes);
  
      const taxDetail = await Tax_Details.findByPk(id);
      if (!taxDetail) {
        return res.status(404).json({ message: "Tax Details not found" });
      }
  
      await taxDetail.destroy();
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Deleted Tax Details successfully", {
        executionTime,
        hospitalDatabase,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
  
      res.status(200).json({
        meta: { message: "Tax Details deleted successfully", statusCode: 200, executionTime },
      });
  
    } catch (error) {
      res.status(500).json({
        meta: { statusCode: 500, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
        error: { message: "Error deleting Tax Details: " + error.message },
      });
    }
  };
  
  