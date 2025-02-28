
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

exports.createFinYrDetails = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    
    let clientIp = "Unknown";
    let locationData = { city: "Unknown", country: "Unknown" };

    try {
        clientIp = await getClientIp(req);
        console.log("clientIp00000000000000000000",clientIp)
    } catch (error) {
        logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
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

    const { fin_code_IDR, startMonth, endMonth, lock, is_Active, hospitalGroupIDR, hospitalIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const Hospital = require("../models/HospitalModel");
        const HospitalGroup = require("../models/HospitalGroup");
        const fin_code = require("../models/Financial_Year_Model")(req.sequelize);

        const hospital = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
        if (!hospital) {
            return res.status(400).json({ message: "Invalid HospitalID, not found in MasterDB" });
        }

        const hospitalGroup = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
        if (!hospitalGroup) {
            return res.status(400).json({ message: "Invalid hospitalGroupIDR, not found in MasterDB" });
        }

        const fin_yr = await fin_code.findOne({ where: { fin_year_code_id: fin_code_IDR } });
        if (!fin_yr) {
            return res.status(400).json({ message: "Invalid Fin_yr_id, not found in MasterDB" });
        }

        await Fin_yr_Details.sync();
      
        const servicePricelist = await Fin_yr_Details.create({
            fin_code_IDR, startMonth, endMonth, lock, is_Active, hospitalGroupIDR, hospitalIDR
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fin-year-details created successfully", {
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

        logger.logWithMeta("error", "Error creating Fin-year-details", {
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
            error: { message: "Error creating Fin-year-details: " + error.message },
        });
    }
};


exports.getFinYrDetails = async (req, res) => {
    const start = Date.now();
    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }
        
        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const finYearDetails = await Fin_yr_Details.findAll();
        
        res.status(200).json({
            meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
            data: finYearDetails
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching financial year details", error: error.message });
    }
};

exports.getFinYrDetailsById = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }
        
        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const finYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
        if (!finYearDetail) {
            return res.status(404).json({ message: "Financial year detail not found" });
        }
        
        res.status(200).json({
            meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
            data: finYearDetail
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching financial year detail", error: error.message });
    }
};

exports.updateFinYrDetails = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }
        
        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
        if (!existingFinYearDetail) {
            return res.status(404).json({ message: "Financial year detail not found" });
        }
        
        await existingFinYearDetail.update(req.body);
        
        res.status(200).json({
            meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
            data: existingFinYearDetail
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating financial year detail", error: error.message });
    }
};


exports.deleteFinYrDetails = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    try {
        if (!req.sequelize) {
            return res.status(500).json({ message: "Database connection not found" });
        }
        
        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
        if (!existingFinYearDetail) {
            return res.status(404).json({ message: "Financial year detail not found" });
        }
        
        await existingFinYearDetail.destroy();
        
        res.status(200).json({
            meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
            message: "Financial year detail deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting financial year detail", error: error.message });
    }
};

