const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const logger = require('../logger');
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper");

exports.createItemContent = async (req, res) => {

    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {

        const { ItemContentName, NonActive, HospitalIDF, HospitalGroupIDF } = req.body;

        const ItemContent = require('../models/itemContentModel')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');

        const hospitalExists = await Hospital.findOne({ where: { HospitalID: HospitalIDF } })
        if (!hospitalExists) {
            throw { errorCode: 9181, message: "Invalid hospital_IDR, not found in Hospital table" };
        }

        if (HospitalGroupIDF) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: HospitalGroupIDF } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9182, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }

        const newItemContent = await ItemContent.create({ ItemContentName, NonActive, HospitalIDF, HospitalGroupIDF, CreatedBy: req.username })

        logger.logWithMeta("info", "Item category created successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item category created successfully", data: newItemContent });

    } catch (error) {

        logger.logWithMeta("error", "Error in createItemCategory", {
            logId, errorCode: error.errorCode || 9185, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message, CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9185, message: error.message });

    }
}

exports.getAllItemContent = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    try {

        const ItemContent = require("../models/itemContentModel.js")(req.sequelize)
        const allItemContents = await ItemContent.findAll();

        logger.logWithMeta("info", "Item Item Content fetched successfully", {
            logId, apiName: req.originalUrl, method: req.method, locationData, CreatedBy: req.hospitalName,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item Item Content fetched successfully", data: allItemContents });

    } catch (error) {

        logger.logWithMeta("error", "Error fetching item Item Content", {
            logId, errorCode: 9174, apiName: req.originalUrl, method: req.method, errorMessage: error.message, locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });
        return res.status(500).json({ errorCode: 9174, message: "Error fetching item Item Content" });
    }
}

exports.getItemContentById = async (req, res) => {

    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {

        const { id } = req.params;

        const ItemContent = require("../models/itemContentModel.js")(req.sequelize)

        const itemCont = await ItemContent.findByPk(id);

        if (!itemCont) {
            logger.logWithMeta("warn", "Item Content not found", {
                logId,
                errorCode: 9175,
                apiName: req.originalUrl,
                method: req.method,
                clientIp,
                locationData,
                CreatedBy: req.username,
                UpdatedBy: req.username
            });
            return res.status(404).json({ errorCode: 9175, message: "Item Content not found" });
        }

        logger.logWithMeta("info", "Item Content fetched successfully", {
            logId,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            locationData,
            data: itemCont,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item Content fetched successfully", data: itemCont });
    } catch (error) {
        logger.logWithMeta("error", "Error fetching Item Content", {
            logId,
            errorCode: 9176,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            errorMessage: error.message,
            locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(500).json({ errorCode: 9176, message: "Error fetching Item Content", error: error.message });
    }
}

exports.updateItemContentById = async (req, res) => {

    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    const updateData = req.body

    try {
        const { id } = req.params;

        const ItemContent = require("../models/itemContentModel.js")(req.sequelize)

        const itemCont = await ItemContent.findByPk(id);

        if (!itemCont) {
            logger.logWithMeta("warn", "Item Content not found", {
                logId,
                errorCode: 9175,
                apiName: req.originalUrl,
                method: req.method,
                clientIp,
                locationData,
                CreatedBy: req.username,
                UpdatedBy: req.username
            });
            return res.status(404).json({ errorCode: 9175, message: "Item Content not found" });
        }

        await itemCont.update({
            ...updateData,
            UpdatedBy: req.username,
            UpdatedAt: new Date(),
        });;

        logger.logWithMeta("info", "Item Content updated successfully", {
            logId,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            locationData,
            data: itemCont,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item Content updated successfully", data: itemCont });
    } catch (error) {
        logger.logWithMeta("error", "Error updating Item Content", {
            logId,
            errorCode: error.errorCode || 9178,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            errorMessage: error.message,
            locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(500).json({ errorCode: 9178, message: "Error updating Item Content", error: error.message });
    }
}

exports.deleteItemContentById = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    try {
        const { id } = req.params;

        const ItemContent = require("../models/itemContentModel.js")(req.sequelize)

        const itemCont = await ItemContent.findByPk(id);

        if (!itemCont) {
            logger.logWithMeta("warn", "Item Content not found", {
                logId,
                errorCode: 9175,
                apiName: req.originalUrl,
                method: req.method,
                clientIp,
                locationData,
                CreatedBy: req.username,
                UpdatedBy: req.username
            });
            return res.status(404).json({ errorCode: 9175, message: "Item Content not found" });
        }


        await itemCont.destroy();

        logger.logWithMeta("info", "Item Content deleted successfully", {
            logId,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item Content deleted successfully" });
    } catch (error) {
        logger.logWithMeta("error", "Error deleting Item Content", {
            logId,
            errorCode: error.errorCode || 9180,
            apiName: req.originalUrl,
            method: req.method,
            clientIp,
            errorMessage: error.message,
            locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(500).json({ errorCode: 9180, message: "Error deleting Item Content", error: error.message });
    }
}