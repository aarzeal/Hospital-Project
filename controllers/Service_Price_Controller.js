
const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const getClientIp = require('../util/clientip')
const getLocationData = require("../util/locationHelper");;

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

exports.createServicePriceList = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9067; // Validation error

        logger.logWithMeta("error", "Validation error in createServicePriceList", {
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

    const { service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR } = req.body;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9068; // Database connection error

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

        const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
        const Hospital = require("../models/HospitalModel")(req.sequelize);
        const Service = require("../models/ser")(req.sequelize);

        // Validate Hospital ID
        const hospital = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
        if (!hospital) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9069; // Hospital ID not found

            logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
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

        // Validate Service ID
        const service = await Service.findOne({ where: { service_id: service_IDR } });
        if (!service) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9070; // Service ID not found

            logger.logWithMeta("error", "Invalid Service ID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                service_IDR
            });

            return res.status(400).json({ 
                message: "Invalid Service ID, not found in MasterDB", 
                statusCode: 400,
                errorCode
            });
        }

        await Service_Price_List.sync();
      
        const servicePricelist = await Service_Price_List.create({
            service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR
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

        res.status(201).json({
            meta: { statusCode: 201, executionTime, hospitalDatabase },
            data: { servicePricelist },
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9071; // General error in creating service price list

        logger.logWithMeta("error", "Error creating ServicePriceList", {
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
            error: { message: "Error creating ServicePriceList: " + error.message },
        });
    }
};

// exports.createServicePriceList = async (req, res) => {
//     const errors = validationResult(req);
//     const start = Date.now();
    
//     const clientIp = await getClientIp(req);
//     const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();

//     if (!errors.isEmpty()) {
//         const executionTime = `${Date.now() - start}ms`;
//         const errorCode = 9047; // Validation error

//         logger.logWithMeta("error", "Validation error in createService", {
//             errorCode,
//             executionTime,
//             hospitalName: req.hospitalName || "Unknown",
//             ip: clientIp,
//             apiName: req.originalUrl,
//             method: req.method,
//             userAgent: req.headers["user-agent"],
//             validationErrors: errors.array(),
//         });

//         return res.status(400).json({ 
//             message: "Validation failed", 
//             statusCode: 400,
//             errorCode,
//             errors: errors.array(),
//         });
//     }

//     const { service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR } = req.body;
//     const hospitalDatabase = req.hospitalDatabase;

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
//         const Hospital = require("../models/HospitalModel");
//         const Service = require("../models/ser")(req.sequelize);

//         const hospital = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
//         if (!hospital) {
//             return res.status(400).json({ message: "Invalid HospitalID, not found in MasterDB" });
//         }

//         const service = await Service.findOne({ where: { service_id: service_IDR } });
//         if (!service) {
//             return res.status(400).json({ message: "Invalid Service ID, not found in MasterDB" });
//         }

//         await Service_Price_List.sync();
      
//         const servicePricelist = await Service_Price_List.create({
//             service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR
//         });

//         const executionTime = `${Date.now() - start}ms`;

//         logger.logWithMeta("info", "ServicePriceList created successfully", {
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

//         logger.logWithMeta("error", "Error creating ServicePriceList", {
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
//             error: { message: "Error creating ServicePriceList: " + error.message },
//         });
//     }
// };


exports.getAllServicePriceLists = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9072; // Database connection error

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

        const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
        const servicePriceLists = await Service_Price_List.findAll();

        if (!servicePriceLists || servicePriceLists.length === 0) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9073; // No service price lists found

            logger.logWithMeta("error", "No service price lists found", {
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
                message: "No service price lists found",
                statusCode: 404,
                errorCode
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fetched all service price lists successfully", {
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
            data: servicePriceLists,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9074; // General error in fetching service price lists

        logger.logWithMeta("error", "Error fetching ServicePriceList", {
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
            error: { message: "Error fetching ServicePriceList: " + error.message },
        });
    }
};

// exports.getAllServicePriceLists = async (req, res) => {
//     const start = Date.now();
//     const clientIp = await getClientIp(req);
//     const locationData = await getLocationData(clientIp);
//     const logId = uuidv4();

   

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);

//         const servicePriceLists = await Service_Price_List.findAll();

//         const executionTime = `${Date.now() - start}ms`;
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime },
//             data: servicePriceLists,
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         logger.logWithMeta("error", "Error fetching ServicePriceList", { executionTime, error: error.message });

//         res.status(500).json({
//             meta: { statusCode: 500, executionTime },
//             error: { message: "Error fetching ServicePriceList: " + error.message },
//         });
//     }
// };

exports.getServicePriceListById = async (req, res) => {
    const start = Date.now();
    const { service_price_id } = req.params;
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9075; // Database connection error

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

        const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
        const servicePriceList = await Service_Price_List.findByPk(service_price_id);

        if (!servicePriceList) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9076; // Service Price List not found

            logger.logWithMeta("error", "Service Price List entry not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                service_price_id
            });

            return res.status(404).json({
                message: "Service Price List entry not found",
                statusCode: 404,
                errorCode
            });
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fetched Service Price List entry successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: servicePriceList,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9077; // General error in fetching service price list by ID

        logger.logWithMeta("error", "Error fetching ServicePriceList by ID", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error fetching ServicePriceList by ID: " + error.message },
        });
    }
};

// exports.getServicePriceListById = async (req, res) => {
//     const start = Date.now();
//     const { service_price_id } = req.params;
//     let clientIp = "Unknown";

//     try {
//         clientIp = await getClientIp(req);
//     } catch (error) {
//         logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
//     }

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);

//         const servicePriceList = await Service_Price_List.findByPk(service_price_id);

//         if (!servicePriceList) {
//             return res.status(404).json({ message: "Service Price List entry not found" });
//         }

//         const executionTime = `${Date.now() - start}ms`;
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime },
//             data: servicePriceList,
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         logger.logWithMeta("error", "Error fetching ServicePriceList by ID", { executionTime, error: error.message });

//         res.status(500).json({
//             meta: { statusCode: 500, executionTime },
//             error: { message: "Error fetching ServicePriceList by ID: " + error.message },
//         });
//     }
// };

exports.updateServicePriceList = async (req, res) => {
    const start = Date.now();
    const { service_price_id } = req.params;
    const { service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR } = req.body;
    
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9078; // Database connection error

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

        const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
        const servicePriceList = await Service_Price_List.findByPk(service_price_id);

        if (!servicePriceList) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9079; // Service Price List not found

            logger.logWithMeta("error", "Service Price List entry not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                service_price_id
            });

            return res.status(404).json({
                message: "Service Price List entry not found",
                statusCode: 404,
                errorCode
            });
        }

        // **Update Service Price List**
        await servicePriceList.update({
            service_IDR,
            First_Emergency_Rate,
            Second_Emergency_Rate,
            From_Date,
            To_Date,
            is_current_Format,
            hospitalIDR,
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service Price List updated successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            data: servicePriceList,
            message: "Service Price List updated successfully",
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9080; // General error in updating service price list

        logger.logWithMeta("error", "Error updating ServicePriceList", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error updating ServicePriceList: " + error.message },
        });
    }
};


// exports.updateServicePriceList = async (req, res) => {
//     const start = Date.now();
//     const { service_price_id } = req.params;
//     const { service_IDR, First_Emergency_Rate, Second_Emergency_Rate, From_Date, To_Date, is_current_Format, hospitalIDR } = req.body;
//     let clientIp = "Unknown";

//     try {
//         clientIp = await getClientIp(req);
//     } catch (error) {
//         logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
//     }

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);

//         const servicePriceList = await Service_Price_List.findByPk(service_price_id);

//         if (!servicePriceList) {
//             return res.status(404).json({ message: "Service Price List entry not found" });
//         }

//         await servicePriceList.update({
//             service_IDR,
//             First_Emergency_Rate,
//             Second_Emergency_Rate,
//             From_Date,
//             To_Date,
//             is_current_Format,
//             hospitalIDR,
//         });

//         const executionTime = `${Date.now() - start}ms`;
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime },
//             data: servicePriceList,
//             message: "Service Price List updated successfully",
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         logger.logWithMeta("error", "Error updating ServicePriceList", { executionTime, error: error.message });

//         res.status(500).json({
//             meta: { statusCode: 500, executionTime },
//             error: { message: "Error updating ServicePriceList: " + error.message },
//         });
//     }
// };

exports.deleteServicePriceList = async (req, res) => {
    const start = Date.now();
    const { service_price_id } = req.params;
    
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        if (!req.sequelize) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9081; // Database connection error

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

        const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);
        const servicePriceList = await Service_Price_List.findByPk(service_price_id);

        if (!servicePriceList) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9082; // Service Price List not found

            logger.logWithMeta("error", "Service Price List entry not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                city: locationData?.city,
                country: locationData?.country,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                service_price_id
            });

            return res.status(404).json({
                message: "Service Price List entry not found",
                statusCode: 404,
                errorCode
            });
        }

        // **Delete Service Price List**
        await servicePriceList.destroy();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Service Price List deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            message: "Service Price List deleted successfully",
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9083; // General error in deleting service price list

        logger.logWithMeta("error", "Error deleting ServicePriceList", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            city: locationData?.city,
            country: locationData?.country,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            service_price_id,
            errorMessage: error.message
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime },
            error: { message: "Error deleting ServicePriceList: " + error.message },
        });
    }
};

// exports.deleteServicePriceList = async (req, res) => {
//     const start = Date.now();
//     const { service_price_id } = req.params;
//     let clientIp = "Unknown";

//     try {
//         clientIp = await getClientIp(req);
//     } catch (error) {
//         logger.logWithMeta("error", "Error fetching client IP", { error: error.message });
//     }

//     try {
//         if (!req.sequelize) {
//             return res.status(500).json({ message: "Database connection not found" });
//         }

//         const Service_Price_List = require("../models/Service_PriceList_Model")(req.sequelize);

//         const servicePriceList = await Service_Price_List.findByPk(service_price_id);

//         if (!servicePriceList) {
//             return res.status(404).json({ message: "Service Price List entry not found" });
//         }

//         await servicePriceList.destroy();

//         const executionTime = `${Date.now() - start}ms`;
//         res.status(200).json({
//             meta: { statusCode: 200, executionTime },
//             message: "Service Price List deleted successfully",
//         });
//     } catch (error) {
//         const executionTime = `${Date.now() - start}ms`;
//         logger.logWithMeta("error", "Error deleting ServicePriceList", { executionTime, error: error.message });

//         res.status(500).json({
//             meta: { statusCode: 500, executionTime },
//             error: { message: "Error deleting ServicePriceList: " + error.message },
//         });
//     }
// };


