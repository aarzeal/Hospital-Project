const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');

const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const getClientIp = require('../util/clientip');
const { validationResult } = require('express-validator');
const getLocationData = require("../util/locationHelper"); 

dotenv.config();


exports.createGroup = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    console.log("Client IP:", clientIp);
    const logId = uuidv4();

    // let locationData = { city: "Unknown" };
    

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9000; // Define a specific error code for validation errors

        logger.logWithMeta("error", "Validation error in createGroup", {
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
            errors: errors.array() 
        });
    }


    const locationData = await getLocationData(clientIp); // Fetch location data

    const { 
        fin_group_name, 
        group_category, 
        types_of_group, 
        is_primary_group, 
        under_group_IDR, 
        master_group_IDR, 
        group_level, 
        is_system_group, 
        for_jv_settelment, 
        remark, 
        hospitalIDR, 
        hospitalGroupIDR ,
        updatedBy
    } = req.body;

    const hospitalDatabase = req.hospitalDatabase;

    try {
        const fin_group = require("../models/Fin-Group")(req.sequelize);
        const Group = require("../models/HospitalGroup");
        const HospitalModel = require("../models/HospitalModel");

        await fin_group.sync({ force: false });

        // Check if HospitalGroupID exists
        const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });

        if (!group) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9001;

            logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });
            return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
        }

          // **Check if the group name is unique for the given hospitalGroupIDR**
          const existingGroup = await fin_group.findOne({
            where: { fin_group_name, hospitalGroupIDR }
        });

        if (existingGroup) {
            return res.status(409).json({ message: "Group name already exists. Please use a different name." });
        }






        // Check if master_group_IDR exists, otherwise set to NULL
        let Master_group_IDR = null;

        if (master_group_IDR) {
            const MasterGroup = await fin_group.findOne({
                where: { fin_group_id: master_group_IDR }
            });

            if (MasterGroup) {
                Master_group_IDR = MasterGroup.fin_group_id;
            }
        }

        // Validate HospitalIDR
        const hospitalRecord = await HospitalModel.findOne({
            where: { hospitalID: hospitalIDR }
        });

        if (!hospitalRecord) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9002;

            logger.logWithMeta("error", "Invalid hospitalID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(400).json({ message: "Invalid hospitalID, not found in MasterDB" });
        }

        // await fin_group.sync();

        const groupData = await fin_group.create({
            fin_group_name, 
            group_category, 
            types_of_group, 
            is_primary_group, 
            under_group_IDR, 
            // master_group_IDR:null , // Use the validated ID
            master_group_IDR: Master_group_IDR  , // Use the validated ID
            group_level, 
            is_system_group, 
            for_jv_settelment, 
            remark, 
            hospitalIDR, 
            hospitalGroupIDR,
            createdBy: req.username,
            updatedBy:req.username
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fin group created successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: { groupData },
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9003;

        logger.logWithMeta("error", "Error creating Fin group", 
            {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating Fin group: " + error.message },
        });
    }
};


exports.getGroup = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);

    const locationData = await getLocationData(clientIp);

    const { fin_group_id } = req.params;  // If an ID is provided, it will fetch by ID; otherwise, it fetches all
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Fin_Group = require("../models/Fin-Group")(req.sequelize);

        let response;
        if (fin_group_id) {
            response = await Fin_Group.findOne({ where: { fin_group_id: fin_group_id } });
            if (!response) {
                const executionTime = `${Date.now() - start}ms`;
                const errorCode = 9004;
        
                logger.logWithMeta("error", `Fin_Group not found"}`, {
                    errorCode,
                    executionTime,
                    hospitalName: req.hospitalName,
                    ip: clientIp,
                  city: locationData?.city,
                  country: locationData?.country,
                  regionName: locationData?.regionName,
                  zip: locationData?.zip,
                    apiName: req.originalUrl,
                    method: req.method,
                    userAgent: req.headers["user-agent"],
                    createdBy: req.username,  // Assign username from token
                    updatedBy: req.username
                });
                return res.status(404).json({errorCode, message: "Fin_Group not found" });
            }
        } else {
            response = await Fin_Group.findAll();
        }

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", `Fetched ${fin_group_id ? "group by ID" : "all "} successfully`, {
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: response,
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9005;

        logger.logWithMeta("error", `Error fetching fin group }`, {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: `Error fetching fin group "}: ` + error.message },
        });
    }
};


exports.updateGroup = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    console.log("Client IP:", clientIp);
    const logId = uuidv4();
    const { fin_group_id } = req.params;  

   

    if (!errors.isEmpty()) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9006; // Define a specific error code for validation errors

        logger.logWithMeta("error", "Validation error in update", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName || "Unknown",
            ip: clientIp,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            validationErrors: errors.array(),
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        return res.status(400).json({ 
            message: "Validation failed", 
            errors: errors.array() 
        });
    }
    const locationData = await getLocationData(clientIp);

    const { 
        
        fin_group_name, 
        group_category, 
        types_of_group, 
        is_primary_group, 
        under_group_IDR, 
        master_group_IDR, 
        group_level, 
        is_system_group, 
        for_jv_settelment, 
        remark, 
        hospitalIDR, 
        hospitalGroupIDR 
    } = req.body;

    const hospitalDatabase = req.hospitalDatabase;

    try {
        const fin_group = require("../models/Fin-Group")(req.sequelize);
        const Group = require("../models/HospitalGroup");
        const HospitalModel = require("../models/HospitalModel");

        // Check if the group exists
        const existingGroup = await fin_group.findOne({ where: { fin_group_id } });
        if (!existingGroup) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9007;

            logger.logWithMeta("error", "Fin group not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,  // Assign username from token
                updatedBy: req.username
            });
            return res.status(404).json({ message: "Fin group not found" });
        }

        // Validate HospitalGroupIDR
        const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
        if (!group) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9008;

            logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });
            return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
        }

        // Validate master_group_IDR
        let Master_group_IDR = null;
        if (master_group_IDR) {
            const MasterGroup = await fin_group.findOne({ where: { fin_group_id: master_group_IDR } });
            if (MasterGroup) {
                Master_group_IDR = MasterGroup.fin_group_id;
            }
        }

        // Validate HospitalIDR
        const hospitalRecord = await HospitalModel.findOne({ where: { hospitalID: hospitalIDR } });
        if (!hospitalRecord) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9009;

            logger.logWithMeta("error", "Invalid hospitalID, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,  // Assign username from token
                updatedBy: req.username
            });
            return res.status(400).json({ message: "Invalid hospitalID, not found in MasterDB" });
        }

        // Update the group
        await existingGroup.update({
            fin_group_name, 
            group_category, 
            types_of_group, 
            is_primary_group, 
            under_group_IDR, 
            master_group_IDR: Master_group_IDR, 
            group_level, 
            is_system_group, 
            for_jv_settelment, 
            remark, 
            hospitalIDR, 
            hospitalGroupIDR
        });

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fin group updated successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: { updatedGroup: existingGroup },
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9010;

        logger.logWithMeta("error", "Error updating Fin group", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error updating Fin group: " + error.message },
        });
    }
};

exports.deleteGroup = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    console.log("Client IP:", clientIp);
    const logId = uuidv4();

    const locationData = await getLocationData(clientIp); // Fetch location data

    const { fin_group_id } = req.params;
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const fin_group = require("../models/Fin-Group")(req.sequelize);

        // Check if the group exists
        const existingGroup = await fin_group.findOne({ where: { fin_group_id } });
        if (!existingGroup) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 9011;

            logger.logWithMeta("error", "Fin group not found", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
                ...locationData,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
                createdBy: req.username,  // Assign username from token
                updatedBy: req.username
            });
            return res.status(404).json({ message: "Fin group not found" });
        }

        // Delete the group
        await existingGroup.destroy();

        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "Fin group deleted successfully", {
            executionTime,
            logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            message: "Fin group deleted successfully",
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9012;

        logger.logWithMeta("error", "Error deleting Fin group", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            createdBy: req.username,  // Assign username from token
            updatedBy: req.username
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error deleting Fin group: " + error.message },
        });
    }
};
