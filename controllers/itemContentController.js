const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const logger = require('../logger');

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
            updatedBy: req.username
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

        logger.logWithMeta("info", "Item itemgroup fetched successfully", {
            logId, apiName: req.originalUrl, method: req.method, locationData, CreatedBy: req.hospitalName,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });

        return res.status(200).json({ message: "Item itemgroup fetched successfully", data: allItemContents });

    } catch (error) {

        logger.logWithMeta("error", "Error fetching item itemgroup", {
            logId, errorCode: 9174, apiName: req.originalUrl, method: req.method, errorMessage: error.message, locationData,
            CreatedBy: req.username,
            UpdatedBy: req.username
        });
        return res.status(500).json({ errorCode: 9174, message: "Error fetching item itemgroup" });
    }
}