const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const logger = require('../logger');
const getClientIp = require('../util/clientip.js');
const getLocationData = require("../util/locationHelper.js");

exports.createInvProduct = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    } 
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {

        const { CompanyName,CompanyCode,Address1,Address2,City,State,Country,ZipCode,Telephone1,Telephone2,Mobile,WhatApp,Email,Website, NonActive, HospitalIDR, HospitalGroupIDR } = req.body;

        const InvProduct = require('../models/InvProdCompany.js')(req.sequelize);
        const Hospital = require('../models/HospitalModel.js');
        const HospitalGroup = require('../models/HospitalGroup');

        await InvProduct.sync({ force: false });

        const hospitalExists = await Hospital.findOne({ where: { HospitalID: HospitalIDR } })
        if (!hospitalExists) {
            throw { errorCode: 9181, message: "Invalid hospital_IDR, not found in Hospital table" };
        }

        if (HospitalGroupIDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9182, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        
        const newInvProduct = await InvProduct.create({CompanyName,CompanyCode,Address1,Address2,City,State,Country,ZipCode,Telephone1,Telephone2,Mobile,WhatApp,Email,Website, NonActive, HospitalIDR, HospitalGroupIDR, CreatedBy: req.username })

        logger.logWithMeta("info", "Item Company created successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item Company created successfully", data: newInvProduct });

    } catch (error) {

        logger.logWithMeta("error", "Error in createItemCategory", {
            logId, errorCode: error.errorCode || 9185, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9185, message: error.message });

    }
}

exports.getAllInvProducts = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
        const InvProduct = require("../models/InvProdCompany.js")(req.sequelize);

        const allInvProducts = await InvProduct.findAll();

        logger.logWithMeta("info", "Fetched all Item Companies successfully", {
            logId,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            totalRecords: allInvProducts.length,
        });

        return res.status(200).json({ message: "All Item Companies retrieved successfully", data: allInvProducts });

    } catch (error) {
        logger.logWithMeta("error", "Error fetching all Item Companies", {
            logId,
            errorCode: error.errorCode || 9186,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
        });

        return res.status(400).json({ errorCode: error.errorCode || 9186, message: error.message });
    }
};

exports.getInvProductById = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
        const { id } = req.params;
        const InvProduct = require("../models/InvProdCompany.js")(req.sequelize);

        const invProduct = await InvProduct.findOne({ where: { InvProductID: id } });

        if (!invProduct) {
            throw { errorCode: 9187, message: "Item Company not found" };
        }

        logger.logWithMeta("info", "Fetched Item Company successfully", {
            logId,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            InvProductID: id,
        });

        return res.status(200).json({ message: "Item Company retrieved successfully", data: invProduct });

    } catch (error) {
        logger.logWithMeta("error", "Error fetching Item Company by ID", {
            logId,
            errorCode: error.errorCode || 9188,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
        });

        return res.status(400).json({ errorCode: error.errorCode || 9188, message: error.message });
    }
};

exports.updateInvProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    } 
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
        const { id } = req.params;
        const { CompanyName, CompanyCode, Address1, Address2, City, State, Country, ZipCode, Telephone1, Telephone2, Mobile, WhatApp, Email, Website, NonActive, HospitalIDR, HospitalGroupIDR } = req.body;

        const InvProduct = require("../models/InvProdCompany.js")(req.sequelize);
        const Hospital = require("../models/HospitalModel.js");
        const HospitalGroup = require("../models/HospitalGroup");

        const invProduct = await InvProduct.findOne({ where: { InvProductID: id } });

        if (!invProduct) {
            throw { errorCode: 9189, message: "Item Company not found" };
        }

        const hospitalExists = await Hospital.findOne({ where: { HospitalID: HospitalIDR } });
        if (!hospitalExists) {
            throw { errorCode: 9190, message: "Invalid hospital_IDR, not found in Hospital table" };
        }

        if (HospitalGroupIDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9191, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        await InvProduct.update(
            { CompanyName, CompanyCode, Address1, Address2, City, State, Country, ZipCode, Telephone1, Telephone2, Mobile, WhatApp, Email, Website, NonActive, HospitalIDR, HospitalGroupIDR, UpdatedBy: req.username, UpdatedAt: new Date() },
            { where: { InvProductID: id } }
        );

        logger.logWithMeta("info", "Item Company updated successfully", {
            logId,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            UpdatedBy: req.username,
            InvProductID: id,
        });

        return res.status(200).json({ message: "Item Company updated successfully" });

    } catch (error) {
        logger.logWithMeta("error", "Error updating Item Company", {
            logId,
            errorCode: error.errorCode || 9192,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
        });

        return res.status(400).json({ errorCode: error.errorCode || 9192, message: error.message });
    }
};

exports.deleteInvProduct = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
        const { id } = req.params;
        const InvProduct = require("../models/InvProdCompany.js")(req.sequelize);

        const invProduct = await InvProduct.findOne({ where: { InvProductID: id } });

        if (!invProduct) {
            throw { errorCode: 9193, message: "Item Company not found" };
        }

        await InvProduct.destroy({ where: { InvProductID: id } });

        logger.logWithMeta("info", "Item Company deleted successfully", {
            logId,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            DeletedBy: req.username,
            InvProductID: id,
        });

        return res.status(200).json({ message: "Item Company deleted successfully" });

    } catch (error) {
        logger.logWithMeta("error", "Error deleting Item Company", {
            logId,
            errorCode: error.errorCode || 9194,
            executionTime: `${Date.now() - start}ms`,
            clientIp,
            apiName: req.originalUrl,
            method: req.method,
            errorMessage: error.message,
        });

        return res.status(400).json({ errorCode: error.errorCode || 9194, message: error.message });
    }
};
