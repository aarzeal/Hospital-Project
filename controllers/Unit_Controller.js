const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const getClientIp = require('../util/clientip'); 
const getLocationData = require("../util/locationHelper");

exports.createUnit = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9193;

        logger.logWithMeta("error", "Validation error in createUnit", {
            logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, validationErrors: errors.array(), createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(400).json({ errorCode, message: "Validation failed", errors: errors.array() });
    }

    try {
        const { unit_name, decimal, remarks, hospitalIDR, hospitalGroupIDR } = req.body;

        // Load models dynamically with request-based Sequelize instance
        const Unit = require('../models/Unit_Model')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');

        await Unit.sync({ alter: true }); // Ensure table exists

        // 🔍 Check if unit_name already exists
        const existingUnit = await Unit.findOne({ where: { unit_name } });
        if (existingUnit) {
            const errorCode = 9194;
            logger.logWithMeta("error", "Unit name already exists", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, unit_name });
            throw { errorCode, message: "Unit name already exists" };
        }

        // 🔍 Check if `hospitalIDR` exists in `Hospital` table
        const hospitalExists = await Hospital.findByPk(hospitalIDR);
        if (!hospitalExists) {
            const errorCode = 9195;
            logger.logWithMeta("error", "Invalid hospitalIDR, not found in Hospital table", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, hospitalIDR , createdBy: req.username,
                updatedBy:req.username});
            throw { errorCode, message: "Invalid hospitalIDR, not found in Hospital table" };
        }

        // 🔍 Check if `hospitalGroupIDR` exists in `HospitalGroup` table
        const hospitalGroupExists = await HospitalGroup.findByPk(hospitalGroupIDR);
        if (!hospitalGroupExists) {
            const errorCode = 9196;
            logger.logWithMeta("error", "Invalid hospitalGroupIDR, not found in HospitalGroup table", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, hospitalGroupIDR, createdBy: req.username,
                updatedBy:req.username });
            throw { errorCode, message: "Invalid hospitalGroupIDR, not found in HospitalGroup table" };
        }

        // ✅ Create new Unit entry
        const newUnit = await Unit.create({
            unit_name, decimal, remarks, hospitalIDR, hospitalGroupIDR,  createdBy: req.username,
            // updatedBy:req.username
        });

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Unit created successfully", {
           
            logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, unitId: newUnit.unit_ID,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            message: "Unit created successfully",
            data: newUnit,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9197; // Default error code for unknown issues

        logger.logWithMeta("error", "Error creating unit", {
            logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, stackTrace: error.stack || "No stack trace available", createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};


// Get all units with pagination
exports.getUnits = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const Unit = require('../models/Unit_Model')(req.sequelize);
        await Unit.sync();

        const units = await Unit.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Units fetched successfully", {
            logId,
            executionTime,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime, total: units.count },
            message: "Units fetched successfully",
            data: units.rows,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9198;

        logger.logWithMeta("error", "Error fetching units", {
            logId,
            errorCode,
            executionTime,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};

// Update a unit
exports.updateUnit = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9199;

        logger.logWithMeta("error", "Validation error in updateUnit", {
            logId,
             errorCode,
              executionTime,
               clientIp,
                apiName: req.originalUrl,
                 method: req.method, validationErrors: errors.array(),
                 createdBy: req.username,
                 updatedBy:req.username
        });

        return res.status(400).json({ errorCode, message: "Validation failed", errors: errors.array() });
    }

    try {
        const { unit_ID } = req.params;
        const { unit_name, decimal, remarks, hospitalIDR, hospitalGroupIDR, updatedBy } = req.body;

        const Unit = require('../models/Unit_Model')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');

        await Unit.sync();

        // 🔍 Check if unit exists
        const unit = await Unit.findByPk(unit_ID);
        if (!unit) {
            const errorCode = 9200;
            logger.logWithMeta("error", "Unit not found", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, unit_ID , createdBy: req.username,
                updatedBy:req.username});
            throw { errorCode, message: "Unit not found" };
        }

        // 🔍 Check if `hospitalIDR` exists in `Hospital` table
        const hospitalExists = await Hospital.findByPk(hospitalIDR);
        if (!hospitalExists) {
            const errorCode = 9201;
            logger.logWithMeta("error", "Invalid hospitalIDR, not found in Hospital table", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, hospitalIDR, createdBy: req.username,
                updatedBy:req.username });
            throw { errorCode, message: "Invalid hospitalIDR, not found in Hospital table" };
        }

        // 🔍 Check if `hospitalGroupIDR` exists in `HospitalGroup` table
        const hospitalGroupExists = await HospitalGroup.findByPk(hospitalGroupIDR);
        if (!hospitalGroupExists) {
            const errorCode = 9203;
            logger.logWithMeta("error", "Invalid hospitalGroupIDR, not found in HospitalGroup table", { logId, errorCode, clientIp, apiName: req.originalUrl, method: req.method, hospitalGroupIDR, createdBy: req.username,
                updatedBy:req.username });
            throw { errorCode, message: "Invalid hospitalGroupIDR, not found in HospitalGroup table" };
        }

        // ✅ Update unit entry
        await unit.update({
            unit_name, decimal, remarks, hospitalIDR, hospitalGroupIDR, updatedBy: req.username,  // Track who updated it
            updatedAt: new Date(), 
        });

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Unit updated successfully", {
            logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, unitId: unit_ID,
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(200).json({
            meta: { statusCode: 200, executionTime },
            message: "Unit updated successfully",
            data: unit,
        });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9204; // Default error code for unknown issues

        logger.logWithMeta("error", "Error updating unit", {
            logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, stackTrace: error.stack || "No stack trace available",
            createdBy: req.username,
            updatedBy:req.username
        });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};


exports.getUnitById = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = getClientIp(req);

    try {
        const { unit_ID } = req.params;
        const Unit = require('../models/Unit_Model')(req.sequelize);
        await Unit.sync();

        const unit = await Unit.findByPk(unit_ID);
        if (!unit) throw { errorCode: 9205, message: "Unit not found" };

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Unit fetched successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, unitId: unit_ID, createdBy: req.username,
            updatedBy:req.username });

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Unit fetched successfully", data: unit });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9206;

        logger.logWithMeta("error", "Error fetching unit", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, createdBy: req.username,
            updatedBy:req.username });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};

// Delete Unit
exports.deleteUnit = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = getClientIp(req);

    try {
        const { unit_ID } = req.params;
        const Unit = require('../models/Unit_Model')(req.sequelize);
        await Unit.sync();

        const unit = await Unit.findByPk(unit_ID);
        if (!unit) throw { errorCode: 9207, message: "Unit not found" };

        await unit.destroy();

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Unit deleted successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, unitId: unit_ID , createdBy: req.username,
            updatedBy:req.username});

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Unit deleted successfully" });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9208;

        logger.logWithMeta("error", "Error deleting unit", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, createdBy: req.username,
            updatedBy:req.username });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};