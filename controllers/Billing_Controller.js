const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const { Op } = require("sequelize");

exports.createBillingClass = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const logId = uuidv4();

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9001;

        logger.logWithMeta("error", "Validation error in createBillingClass", {
            logId,
            errorCode,
            executionTime,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            validationErrors: errors.array(),
        });

        return res.status(400).json({ errorCode, message: "Validation failed", errors: errors.array() });
    }

    try {
        const {
            billing_Class_name,
            billing_Class_Code,
            billing_Class_Category,
            ledger_IDR,
            email,
            hospital_IDR,
            hospitalGroup_IDR,
            is_Copay_AllowedOn_OPD,
            city,
            state,
            Mobile,
            whatapp_Number,
            rate_baseOn
        } = req.body;

        const BillingClass = require('../models/Billing_Class')(req.sequelize);

        // Check if billing_Class_name, billing_Class_Code, email, or Mobile already exists
        const existingBillingClass = await BillingClass.findOne({
            where: {
                [Op.or]: [
                    { billing_Class_name },
                    { billing_Class_Code },
                    { email },
                    { Mobile }
                ]
            }
        });
        if (existingBillingClass) {
            if (existingBillingClass.billing_Class_name === billing_Class_name) {
    throw { errorCode: 9006, message: "Billing class name already exists" };
} else if (existingBillingClass.billing_Class_Code === billing_Class_Code) {
    throw { errorCode: 9007, message: "Billing class code already exists" };
} else if (existingBillingClass.email === email) {
    throw { errorCode: 9008, message: "Email already exists" };
} else if (existingBillingClass.Mobile === Mobile) {
    throw { errorCode: 9009, message: "Mobile number already exists" };
}
        }

        // Check foreign key dependencies
        const Ledger = require('../models/AccLedger')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');

        const ledgerExists = await Ledger.findByPk(ledger_IDR);
        if (!ledgerExists) {
            throw { errorCode: 9002, message: "Invalid ledger_IDR, not found in Ledger table" };
        }

        const hospitalExists = await Hospital.findByPk(hospital_IDR);
        if (!hospitalExists) {
            throw { errorCode: 9003, message: "Invalid hospital_IDR, not found in Hospital table" };
        }

        if (hospitalGroup_IDR) {
            const hospitalGroupExists = await HospitalGroup.findByPk(hospitalGroup_IDR);
            if (!hospitalGroupExists) {
                throw { errorCode: 9004, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        // Create billing class entry
        const newBillingClass = await BillingClass.create({
            billing_Class_name,
            billing_Class_Code,
            billing_Class_Category,
            ledger_IDR,
            email,
            hospital_IDR,
            hospitalGroup_IDR,
            is_Copay_AllowedOn_OPD,
            city,
            state,
            Mobile,
            whatapp_Number,
            rate_baseOn
        });

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Billing class created successfully", {
            logId,
            executionTime,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            billingClassId: newBillingClass.billing_Class_ID,
        });

        res.status(201).json({
            meta: { statusCode: 201, executionTime },
            message: "Billing class created successfully",
            data: newBillingClass,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9005;

        logger.logWithMeta("error", "Error creating billing class", {
            logId,
            errorCode,
            executionTime,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
        });

        res.status(500).json({ errorCode, message: error.message || "Internal server error" });
    }
};

exports.getBillingClassById = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { id } = req.params;
        const BillingClass = require('../models/Billing_Class')(req.sequelize);
        const billingClass = await BillingClass.findByPk(id);

        if (!billingClass) {
            throw { errorCode: 9007, message: "Billing class not found" };
        }

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Billing class retrieved successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, billingClassId: id });

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Billing class retrieved successfully", data: billingClass });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9008;
        logger.logWithMeta("error", "Error retrieving billing class", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });

        res.status(404).json({ errorCode, message: error.message });
    }
};

// Get All Billing Classes
exports.getAllBillingClasses = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const BillingClass = require('../models/Billing_Class')(req.sequelize);
        const billingClasses = await BillingClass.findAll();

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "All billing classes retrieved successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method });

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Billing classes retrieved successfully", data: billingClasses });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9009;
        logger.logWithMeta("error", "Error retrieving billing classes", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });

        res.status(500).json({ errorCode, message: error.message });
    }
};

// Update Billing Class
exports.updateBillingClass = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9010;
        logger.logWithMeta("error", "Validation error in updateBillingClass", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, validationErrors: errors.array() });

        return res.status(400).json({ errorCode, message: "Validation failed", errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const BillingClass = require('../models/Billing_Class')(req.sequelize);
        const billingClass = await BillingClass.findByPk(id);

        if (!billingClass) {
            throw { errorCode: 9011, message: "Billing class not found" };
        }

        await billingClass.update(req.body);

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Billing class updated successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, billingClassId: id });

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Billing class updated successfully", data: billingClass });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9012;
        logger.logWithMeta("error", "Error updating billing class", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });

        res.status(500).json({ errorCode, message: error.message });
    }
};

// Delete Billing Class
exports.deleteBillingClass = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { id } = req.params;
        const BillingClass = require('../models/Billing_Class')(req.sequelize);
        const billingClass = await BillingClass.findByPk(id);

        if (!billingClass) {
            throw { errorCode: 9013, message: "Billing class not found" };
        }

        await billingClass.destroy();

        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("info", "Billing class deleted successfully", { logId, executionTime, clientIp, apiName: req.originalUrl, method: req.method, billingClassId: id });

        res.status(200).json({ meta: { statusCode: 200, executionTime }, message: "Billing class deleted successfully" });

    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = error.errorCode || 9014;
        logger.logWithMeta("error", "Error deleting billing class", { logId, errorCode, executionTime, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });

        res.status(500).json({ errorCode, message: error.message });
    }
};