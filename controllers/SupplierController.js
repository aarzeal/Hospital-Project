const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const logger = require('../logger');
const { Op } = require('sequelize');
const getClientIp = require('../util/clientip.js');
const getLocationData = require("../util/locationHelper.js");

exports.createSupplier = async (req, res) => {
     const errors = validationResult(req);
        if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
        } 
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const {
            supplier_name, supplier_Code, contact_Person, contact_Person2, Remarks,
            GST_Number, TIN_Number, CST_Number, service_Tax_Number, pan_Number,
            VAT_Number, web_site, ledger_IDR, is_PurchesInvoice_SMS, billPass_SMS,
            update_onWhatapp, address1, address2, city, state, country, zip,
            phone1, phone2, Mobile, whatapp_Number, email, hospital_IDR, hospitalGroup_IDR,Non_Active
        } = req.body;

        const Supplier = require('../models/Supplier.js')(req.sequelize);
        const ledgerIDR = require('../models/AccLedger.js')(req.sequelize);
        const Hospital = require('../models/HospitalModel.js');
        const HospitalGroup = require('../models/HospitalGroup');

        await Supplier.sync({ force: false });

        const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
        if (!hospitalExists) {
            throw { errorCode: 9209, message: "Invalid hospital_IDR, not found in Hospital table" };
        }

        const ledger = await ledgerIDR.findOne({ where: { ledger_id: ledger_IDR } });
        if (!ledger) {
            throw { errorCode: 9210, message: "Invalid ledger_id, not found in ledger table" };
        }

        if (hospitalGroup_IDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9211, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        const newSupplier = await Supplier.create({
            supplier_name, supplier_Code, contact_Person, contact_Person2, Remarks,
            GST_Number, TIN_Number, CST_Number, service_Tax_Number, pan_Number,
            VAT_Number, web_site, ledger_IDR, is_PurchesInvoice_SMS, billPass_SMS,
            update_onWhatapp, address1, address2, city, state, country, zip,
            phone1, phone2, Mobile, whatapp_Number, email, hospital_IDR, hospitalGroup_IDR,Non_Active,
            createdBy: req.username,
        });

        logger.logWithMeta("info", "Supplier created successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, CreatedBy: req.username, UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Supplier created successfully", data: newSupplier });

    } catch (error) {
        logger.logWithMeta("error", "Error in createSupplier", {
            logId, errorCode: error.errorCode || 9212, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, CreatedBy: req.username, UpdatedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9213, message: error.message });
    }
};


exports.getSuppliers = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const Supplier = require('../models/Supplier.js')(req.sequelize);
        await Supplier.sync({ force: false });

        const suppliers = await Supplier.findAll();

        logger.logWithMeta("info", "Suppliers retrieved successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method
        });

        return res.status(200).json({ message: "Suppliers retrieved successfully", data: suppliers });
    } catch (error) {
        logger.logWithMeta("error", "Error in getSuppliers", {
            logId, errorCode: error.errorCode || 9214, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message
        });

        return res.status(400).json({ errorCode: error.errorCode || 9215, message: error.message });
    }
};

exports.getSupplierById = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { supplier_ID } = req.params;

    try {
        const Supplier = require('../models/Supplier.js')(req.sequelize);
        await Supplier.sync({ force: false });

        const supplier = await Supplier.findOne({ where: { supplier_ID } });
        if (!supplier) {
            throw { errorCode: 9216, message: "Supplier not found" };
        }

        logger.logWithMeta("info", "Supplier retrieved successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method
        });

        return res.status(200).json({ message: "Supplier retrieved successfully", data: supplier });
    } catch (error) {
        logger.logWithMeta("error", "Error in getSupplierById", {
            logId, errorCode: error.errorCode || 9217, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message
        });

        return res.status(400).json({ errorCode: error.errorCode || 9218, message: error.message });
    }
};



exports.updateSupplier = async (req, res) => {
     const errors = validationResult(req);
        if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
        } 
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { supplier_ID } = req.params;
        const {
            supplier_name, supplier_Code, contact_Person, contact_Person2, Remarks,
            GST_Number, TIN_Number, CST_Number, service_Tax_Number, pan_Number,
            VAT_Number, web_site, ledger_IDR, is_PurchesInvoice_SMS, billPass_SMS,
            update_onWhatapp, address1, address2, city, state, country, zip,
            phone1, phone2, Mobile, whatapp_Number, email, hospital_IDR, hospitalGroup_IDR,Non_Active
        } = req.body;

        const Supplier = require('../models/Supplier.js')(req.sequelize);
        const ledgerIDR = require('../models/AccLedger.js')(req.sequelize);
        const Hospital = require('../models/HospitalModel.js');
        const HospitalGroup = require('../models/HospitalGroup');

        await Supplier.sync({ force: false });

        const supplier = await Supplier.findOne({ where: { supplier_ID } });
        if (!supplier) {
            throw { errorCode: 9219, message: "Supplier not found" };
        }

        if (hospital_IDR) {
            const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
            if (!hospitalExists) {
                throw { errorCode: 9220, message: "Invalid hospital_IDR, not found in Hospital table" };
            }
        }

        if (ledger_IDR) {
            const ledger = await ledgerIDR.findOne({ where: { ledger_id: ledger_IDR } });
            if (!ledger) {
                throw { errorCode: 9221, message: "Invalid ledger_IDR, not found in ledger table" };
            }
        }

        if (hospitalGroup_IDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9222, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        await supplier.update({
            supplier_name, supplier_Code, contact_Person, contact_Person2, Remarks,
            GST_Number, TIN_Number, CST_Number, service_Tax_Number, pan_Number,
            VAT_Number, web_site, ledger_IDR, is_PurchesInvoice_SMS, billPass_SMS,
            update_onWhatapp, address1, address2, city, state, country, zip,
            phone1, phone2, Mobile, whatapp_Number, email, hospital_IDR, hospitalGroup_IDR,Non_Active,
            updatedBy: req.username,
        });

        logger.logWithMeta("info", "Supplier updated successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Supplier updated successfully", data: supplier });

    } catch (error) {
        logger.logWithMeta("error", "Error in updateSupplier", {
            logId, errorCode: error.errorCode || 9223, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, UpdatedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9224, message: error.message });
    }
};




exports.deleteSupplier = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { supplier_ID } = req.params;
        const Supplier = require('../models/Supplier.js')(req.sequelize);

        await Supplier.sync({ force: false });

        const supplier = await Supplier.findOne({ where: { supplier_ID } });
        if (!supplier) {
            throw { errorCode: 9225, message: "Supplier not found" };
        }

        await supplier.destroy();

        logger.logWithMeta("info", "Supplier deleted successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, DeletedBy: req.username
        });

        return res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) 
    {
        logger.logWithMeta("error", "Error in deleteSupplier", {
            logId, errorCode: error.errorCode || 9226, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, DeletedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9226, message: error.message });
    }
};
