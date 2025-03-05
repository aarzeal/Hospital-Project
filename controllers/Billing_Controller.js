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

        // Check if billing_Class_name or billing_Class_Code already exists
        const existingBillingClass = await BillingClass.findOne({
            where: {
                [Op.or]: [
                    { billing_Class_name },
                    { billing_Class_Code }
                ]
            }
        });
        if (existingBillingClass) {
            throw { errorCode: 9006, message: "Billing class name or code already exists" };
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
