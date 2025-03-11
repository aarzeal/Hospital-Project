const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const logger = require('../logger');
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper"); 


exports.createItemGroup = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    // console.log("clientIp0000000000",clientIp)
    const locationData = await getLocationData(clientIp);
    const logId = uuidv4();

    try {
        const { group_name,parent_groupIDR,hospitalIDR,Non_Active,HospitalGroupIDR } = req.body;
        const ItemGroup = require('../models/ItemGroupModel')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');
      
        
        // Validate foreign keys
        const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospitalIDR } });
        if (!hospitalExists) {
            throw { errorCode: 9171, message: "Invalid hospital_IDR, not found in Hospital table" };
        }
        
        if (HospitalGroupIDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: HospitalGroupIDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9172, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }


         // Check if master_group_IDR exists, otherwise set to NULL
         let Parent_groupIDR = null;

         if (Parent_groupIDR) {
             const MasterGroup = await ItemGroup.findOne({
                 where: { Item_Group_id: parent_groupIDR }
             });
 
             if (MasterGroup) {
                parent_groupIDR = MasterGroup.Item_Group_id;
             }
         }


        
         await ItemGroup.sync();
        
        const newGroup = await ItemGroup.create({group_name,parent_groupIDR,hospitalIDR,Non_Active,HospitalGroupIDR, createdBy: req.username,
            updatedBy:req.username});
        
        logger.logWithMeta("info", "Item Group created successfully", { logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method ,createdBy: req.username,locationData, createdBy: req.username,
        updatedBy:req.username});
        
        return res.status(200).json({ message: "Item Group created successfully", data: newGroup });
    } catch (error) {
        logger.logWithMeta("error", "Error in createItemGroup", { logId, errorCode: error.errorCode || 9173, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message ,createdBy: req.username,locationData, createdBy: req.username,
        updatedBy:req.username});
        return res.status(400).json({ errorCode: error.errorCode || 9173, message: error.message });
    }
};


exports.getAllItemGroup = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);
    try {
        const ItemGroup = require('../models/ItemGroupModel')(req.sequelize);
        const itemgroup = await ItemGroup.findAll();
        logger.logWithMeta("info", "Item itemgroup fetched successfully", { logId, apiName: req.originalUrl, method: req.method ,locationData,createdBy:req.hospitalName, createdBy: req.username,
            updatedBy:req.username});
        return res.status(200).json({ message: "Item itemgroup fetched successfully", data: itemgroup });
    } catch (error) {
        logger.logWithMeta("error", "Error fetching item itemgroup", { logId, errorCode: 9174, apiName: req.originalUrl, method: req.method, errorMessage: error.message ,locationData, createdBy: req.username,
            updatedBy:req.username});
        return res.status(500).json({ errorCode: 9174, message: "Error fetching item itemgroup" });
    }
};

exports.getItemGroupById = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { Item_Group_id } = req.params;
        const ItemGroup = require('../models/ItemGroupModel')(req.sequelize);

        const itemGroup = await ItemGroup.findByPk(Item_Group_id);
        
        if (!itemGroup) {
            logger.logWithMeta("warn", "ItemGroup not found", { 
                logId, 
                errorCode: 9175, 
                apiName: req.originalUrl, 
                method: req.method, 
                clientIp, 
                locationData,
                createdBy: req.username,
                updatedBy:req.username
            });
            return res.status(404).json({ errorCode: 9175, message: "Item Group not found" });
        }

        logger.logWithMeta("info", "ItemGroup fetched successfully", { 
            logId, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            locationData,
            data: itemGroup,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(200).json({ message: "Item Group fetched successfully", data: itemGroup });
    } catch (error) {
        logger.logWithMeta("error", "Error fetching ItemGroup", { 
            logId, 
            errorCode: 9176, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            errorMessage: error.message, 
            locationData ,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(500).json({ errorCode: 9176, message: "Error fetching Item Group", error: error.message });
    }
};


exports.updateItemGroup = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { Item_Group_id } = req.params;
        const ItemGroup = require('../models/ItemGroupModel')(req.sequelize);

        const itemGroup = await ItemGroup.findByPk(Item_Group_id);
        if (!itemGroup) {
            logger.logWithMeta("warn", "Item Group not found", { 
                logId, 
                errorCode: 9177, 
                apiName: req.originalUrl, 
                method: req.method, 
                clientIp, 
                locationData,
                createdBy: req.username,
                updatedBy:req.username
            });
            return res.status(404).json({ errorCode: 9177, message: "Item Group not found" });
        }

        await itemGroup.update(req.body);

        logger.logWithMeta("info", "Item Group updated successfully", { 
            logId, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            locationData, 
            data: itemGroup,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(200).json({ message: "Item Group updated successfully", data: itemGroup });
    } catch (error) {
        logger.logWithMeta("error", "Error updating Item Group", { 
            logId, 
            errorCode: error.errorCode || 9178, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            errorMessage: error.message, 
            locationData,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(500).json({ errorCode: 9178, message: "Error updating Item Group", error: error.message });
    }
};


exports.deleteItemGroup = async (req, res) => {
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { Item_Group_id } = req.params;
        const ItemGroup = require('../models/ItemGroupModel')(req.sequelize);

        const itemGroup = await ItemGroup.findByPk(Item_Group_id);
        if (!itemGroup) {
            logger.logWithMeta("warn", "Item Group not found", { 
                logId, 
                errorCode: 9179, 
                apiName: req.originalUrl, 
                method: req.method, 
                clientIp, 
                locationData,
                createdBy: req.username,
                updatedBy:req.username
            });
            return res.status(404).json({ errorCode: 9179, message: "Item Group not found" });
        }

        await itemGroup.destroy();

        logger.logWithMeta("info", "Item Group deleted successfully", { 
            logId, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            locationData,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(200).json({ message: "Item Group deleted successfully" });
    } catch (error) {
        logger.logWithMeta("error", "Error deleting Item Group", { 
            logId, 
            errorCode: error.errorCode || 9180, 
            apiName: req.originalUrl, 
            method: req.method, 
            clientIp, 
            errorMessage: error.message, 
            locationData,
            createdBy: req.username,
            updatedBy:req.username
        });

        return res.status(500).json({ errorCode: 9180, message: "Error deleting Item Group", error: error.message });
    }
};

