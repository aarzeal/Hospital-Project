
const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper");

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

// exports.createFinYrDetails = async (req, res) => {
//     const errors = validationResult(req);
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
    
//     const locationData = await getLocationData(clientIp);

//     console.log("Client IP:", clientIp);
//     const logId = uuidv4();

//     if (!errors.isEmpty()) {
//           const executionTime = `${Date.now() - start}ms`;
//           const errorCode = 9013; // Validation error
  
//           logger.logWithMeta("error", "Validation error in createFinYear Details", {
//               errorCode,
//               executionTime,
//               hospitalName: req.hospitalName || "Unknown",
//               ip: clientIp,
//               apiName: req.originalUrl,
//               method: req.method,
//               userAgent: req.headers["user-agent"],
//               validationErrors: errors.array(),
//           });
  
//           return res.status(400).json({ 
//               message: "Validation failed", 
//               statusCode: 400,
//               errorCode,
//               errors: errors.array(),
//           });
//       }
//     // try {
//     //     const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
//     //     locationData = locationResponse.data || { city: "Unknown", country: "Unknown" };
//     // } catch (error) {
//     //     logger.logWithMeta("error", "Error fetching location data", { error: error.message });
//     // }

//     const { fin_code_IDR, startMonth, endMonth, lock, is_Active, hospitalGroupIDR, hospitalIDR } = req.body;
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
//         const Hospital = require("../models/HospitalModel");
//         const HospitalGroup = require("../models/HospitalGroup");
//         const fin_code = require("../models/Financial_Year_Model")(req.sequelize);

//         const hospital = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
//         if (!hospital) {
//             return res.status(400).json({ message: "Invalid HospitalID, not found in MasterDB" });
//         }

//         const hospitalGroup = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
//         if (!hospitalGroup) {
//             return res.status(400).json({ message: "Invalid hospitalGroupIDR, not found in MasterDB" });
//         }

//         const fin_yr = await fin_code.findOne({ where: { fin_year_code_id: fin_code_IDR } });
//         if (!fin_yr) {
//             return res.status(400).json({ message: "Invalid Fin_yr_id, not found in MasterDB" });
//         }

//         await Fin_yr_Details.sync();
      
//         const servicePricelist = await Fin_yr_Details.create({
//             fin_code_IDR, startMonth, endMonth, lock, is_Active, hospitalGroupIDR, hospitalIDR
//         });

//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", "Fin-year-details created successfully", {
//             executionTime,
//             logId,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//         });

//         res.status(200).json({
//             meta: { statusCode: 200, executionTime, hospitalDatabase },
//             data: { servicePricelist },
//         });

//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("error", "Error creating Fin-year-details", {
//             errorCode: 1281,
//             executionTime,
//             hospitalName: req.hospitalName,
//             ip: clientIp,
//             city: locationData?.city,
//             country: locationData?.country,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//         });

//         res.status(500).json({
//             meta: { statusCode: 500, errorCode: 1281, executionTime, hospitalDatabase },
//             error: { message: "Error creating Fin-year-details: " + error.message },
//         });
//     }
// };


exports.createFinYrDetails = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9028; // Validation error

        logger.logWithMeta("error", "Validation error in createFinYrDetails", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
        });

        return res.status(400).json({ 
            message: "Validation failed", 
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }

    const { fin_code_IDR, startMonth, endMonth, lock, is_Active, hospitalGroupIDR, hospitalIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9029; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(500).json({ 
                message: "Database connection not found", 
                statusCode: 500, 
                errorCode 
            });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const Hospital = require("../models/HospitalModel");
        const HospitalGroup = require("../models/HospitalGroup");
        const fin_code = require("../models/Financial_Year_Model")(req.sequelize);

        // Validate Hospital ID
        const hospital = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
        if (!hospital) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9030; // Hospital not found

            logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                hospitalIDR
            });

            return res.status(400).json({ 
                message: "Invalid HospitalID, not found in MasterDB",
                statusCode: 400,
                errorCode 
            });
        }

        // Validate HospitalGroup ID
        const hospitalGroup = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
        if (!hospitalGroup) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9031; // HospitalGroup not found

            logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                hospitalGroupIDR
            });

            return res.status(400).json({ 
                message: "Invalid hospitalGroupIDR, not found in MasterDB",
                statusCode: 400,
                errorCode 
            });
        }

        // Validate Financial Year Code
        const fin_yr = await fin_code.findOne({ where: { fin_year_code_id: fin_code_IDR } });
        if (!fin_yr) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9032; // Financial Year Code not found

            logger.logWithMeta("error", "Invalid Fin_yr_id, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                fin_code_IDR
            });

            return res.status(400).json({ 
                message: "Invalid Fin_yr_id, not found in MasterDB",
                statusCode: 400,
                errorCode 
            });
        }

        await Fin_yr_Details.sync();
      
        const finYrDetail = await Fin_yr_Details.create({
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

        res.status(201).json({
            meta: { statusCode: 201, executionTime, hospitalDatabase },
            data: { finYrDetail },
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9033; // General error in creating Fin-Year Details

        logger.logWithMeta("error", "Error creating Fin-year-details", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating Fin-year-details: " + error.message },
        });
    }
};

exports.getFinYrDetails = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9034; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(500).json({ 
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const finYearDetails = await Fin_yr_Details.findAll();

        if (!finYearDetails || finYearDetails.length === 0) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9035; // No financial year details found

            logger.logWithMeta("error", "No Financial Year Details found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(404).json({ 
                message: "No Financial Year Details found",
                statusCode: 404,
                errorCode
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Financial Year Details retrieved successfully", {
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
            meta: { statusCode: 200, executionTime },
            data: finYearDetails
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9036; // General error in fetching financial year details

        logger.logWithMeta("error", "Error fetching financial year details", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error fetching financial year details: " + error.message },
        });
    }
};


// exports.getFinYrDetails = async (req, res) => {
//     const start = Date.now();
//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }
        
//         const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
//         const finYearDetails = await Fin_yr_Details.findAll();
        
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//             data: finYearDetails
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching financial year details", error: error.message });
//     }
// };

// exports.getFinYrDetailsById = async (req, res) => {
//     const start = Date.now();
//     const { fin_year_Detail_id } = req.params;
//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }
        
//         const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
//         const finYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
//         if (!finYearDetail) {
//             return res.status(404).json({ message: "Financial year detail not found" });
//         }
        
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//             data: finYearDetail
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching financial year detail", error: error.message });
//     }
// };


exports.getFinYrDetailsById = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9037; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(500).json({ 
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const finYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id } });

        if (!finYearDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9038; // Financial year detail not found

            logger.logWithMeta("error", "Financial Year Detail not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                fin_year_Detail_id
            });

            return res.status(404).json({ 
                message: "Financial Year Detail not found",
                statusCode: 404,
                errorCode
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Financial Year Detail retrieved successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: finYearDetail
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9039; // General error in fetching financial year detail

        logger.logWithMeta("error", "Error fetching Financial Year Detail", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error fetching Financial Year Detail: " + error.message },
        });
    }
};

exports.updateFinYrDetails = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    const errors = validationResult(req);
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9040; // Validation error

        logger.logWithMeta("error", "Validation error in updateFinYrDetails", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
        });

        return res.status(400).json({
            message: "Validation failed",
            statusCode: 400,
            errorCode,
            errors: errors.array(),
        });
    }

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9041; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(500).json({
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id } });

        if (!existingFinYearDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9042; // Financial Year Detail not found

            logger.logWithMeta("error", "Financial Year Detail not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                fin_year_Detail_id
            });

            return res.status(404).json({
                message: "Financial Year Detail not found",
                statusCode: 404,
                errorCode
            });
        }

        await existingFinYearDetail.update(req.body);
        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Financial Year Detail updated successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: existingFinYearDetail,
            message: "Financial Year Detail updated successfully"
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9043; // General error in updating

        logger.logWithMeta("error", "Error updating Financial Year Detail", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error updating Financial Year Detail: " + error.message },
        });
    }
};
// exports.updateFinYrDetails = async (req, res) => {
//     const start = Date.now();
//     const { fin_year_Detail_id } = req.params;
//     const errors = validationResult(req);
    
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
    
//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }
        
//         const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
//         const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
//         if (!existingFinYearDetail) {
//             return res.status(404).json({ message: "Financial year detail not found" });
//         }
        
//         await existingFinYearDetail.update(req.body);
        
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//             data: existingFinYearDetail
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating financial year detail", error: error.message });
//     }
// };


exports.deleteFinYrDetails = async (req, res) => {
    const start = Date.now();
    const { fin_year_Detail_id } = req.params;
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9044; // Database connection error

            logger.logWithMeta("error", "Database connection not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName || "Unknown",
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(500).json({
                message: "Database connection not found",
                statusCode: 500,
                errorCode
            });
        }

        const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
        const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id } });

        if (!existingFinYearDetail) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9045; // Financial Year Detail not found

            logger.logWithMeta("error", "Financial Year Detail not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                fin_year_Detail_id
            });

            return res.status(404).json({
                message: "Financial Year Detail not found",
                statusCode: 404,
                errorCode
            });
        }

        await existingFinYearDetail.destroy();
        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Financial Year Detail deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            message: "Financial Year Detail deleted successfully"
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9046; // General error in deleting

        logger.logWithMeta("error", "Error deleting Financial Year Detail", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            fin_year_Detail_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error deleting Financial Year Detail: " + error.message },
        });
    }
};

// exports.deleteFinYrDetails = async (req, res) => {
//     const start = Date.now();
//     const { fin_year_Detail_id } = req.params;
//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }
        
//         const Fin_yr_Details = require("../models/Fin_Year_Details")(req.sequelize);
//         const existingFinYearDetail = await Fin_yr_Details.findOne({ where: { fin_year_Detail_id: fin_year_Detail_id } });
        
//         if (!existingFinYearDetail) {
//             return res.status(404).json({ message: "Financial year detail not found" });
//         }
        
//         await existingFinYearDetail.destroy();
        
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//             message: "Financial year detail deleted successfully"
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting financial year detail", error: error.message });
//     }
// };

