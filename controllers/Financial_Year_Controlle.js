
const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const getClientIp = require('../util/clientip');

const { validationResult } = require('express-validator');

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

exports.createFinYear = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    
    let clientIp = "Unknown";
    let locationData = { city: "Unknown", country: "Unknown" };

    try {
        clientIp = await getClientIp(req);
    } catch (error) {
        logger.logWithMeta("error", "Validation errors in createFinYear", {
            errorCode: 1302,
            errors: errors.array(),
        });
        
    }

    console.log("Client IP:", clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        locationData = locationResponse.data || { city: "Unknown", country: "Unknown" };
    } catch (error) {
        logger.logWithMeta("error", "Error fetching location data", { error: error.message });
    }

    const { fin_year } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Financial_Year = require("../models/Financial_Year_Model")(req.sequelize);
       

      

        await Financial_Year.sync();
      
        const servicePricelist = await Financial_Year.create({
            fin_year
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "ServicePriceList created successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime, hospitalDatabase },
            data: { servicePricelist },
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("error", "Error creating ServicePriceList", {
            errorCode: 1281,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode: 1281, executionTime, hospitalDatabase },
            error: { message: "Error creating ServicePriceList: " + error.message },
        });
    }
};
exports.getAllFinYears = async (req, res) => {
    const start = Date.now();
    let clientIp = "Unknown";

    try {
        clientIp = await getClientIp(req);
    } catch (error) {
        logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
    }

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Financial_Year = require("../models/Financial_Year_Model")(req.sequelize);

        const financialYears = await Financial_Year.findAll();

        const executionTime = `${Date.now() - start}ms`;
        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: financialYears,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("error", "Error fetching Financial Years", { executionTime, error: error.message });

        res.status(500).json({
            meta: { statusCode: 500, executionTime },
            error: { message: "Error fetching Financial Years: " + error.message },
        });
    }
};
exports.getFinYearById = async (req, res) => {
    const start = Date.now();
    const { fin_year_code_id } = req.params;
    let clientIp = "Unknown";

    try {
        clientIp = await getClientIp(req);
    } catch (error) {
        logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
    }

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Financial_Year = require("../models/Financial_Year_Model")(req.sequelize);

        const financialYear = await Financial_Year.findByPk(fin_year_code_id);

        if (!financialYear) {
            return res.status(404).json({ message: "Financial Year not found" });
        }

        const executionTime = `${Date.now() - start}ms`;
        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: financialYear,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("error", "Error fetching Financial Year by ID", { executionTime, error: error.message });

        res.status(500).json({
            meta: { statusCode: 500, executionTime },
            error: { message: "Error fetching Financial Year by ID: " + error.message },
        });
    }
};

exports.updateFinYear = async (req, res) => {
    const start = Date.now();
    const { fin_year_code_id } = req.params;
    const { fin_year } = req.body;
    let clientIp = "Unknown";

    try {
        clientIp = await getClientIp(req);
    } catch (error) {
        logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
    }

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Financial_Year = require("../models/Financial_Year_Model")(req.sequelize);

        const financialYear = await Financial_Year.findByPk(fin_year_code_id);

        if (!financialYear) {
            return res.status(404).json({ message: "Financial Year not found" });
        }

        await financialYear.update({ fin_year });

        const executionTime = `${Date.now() - start}ms`;
        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: financialYear,
            message: "Financial Year updated successfully",
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("error", "Error updating Financial Year", { executionTime, error: error.message });

        res.status(500).json({
            meta: { statusCode: 500, executionTime },
            error: { message: "Error updating Financial Year: " + error.message },
        });
    }
};


exports.deleteFinYear = async (req, res) => {
    const start = Date.now();
    const { fin_year_code_id } = req.params;
    let clientIp = "Unknown";

    try {
        clientIp = await getClientIp(req);
    } catch (error) {
        logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
    }

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Financial_Year = require("../models/Financial_Year_Model")(req.sequelize);

        const financialYear = await Financial_Year.findByPk(fin_year_code_id);

        if (!financialYear) {
            return res.status(404).json({ message: "Financial Year not found" });
        }

        await financialYear.destroy();

        const executionTime = `${Date.now() - start}ms`;
        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            message: "Financial Year deleted successfully",
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("error", "Error deleting Financial Year", { executionTime, error: error.message });

        res.status(500).json({
            meta: { statusCode: 500, executionTime },
            error: { message: "Error deleting Financial Year: " + error.message },
        });
    }
};


