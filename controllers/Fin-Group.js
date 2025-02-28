const logger = require('../logger');
const { v4: uuidv4 } = require("uuid");

const dotenv = require('dotenv');
const axios = require('axios');

const { Sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const getClientIp = require('../util/clientip');
const { validationResult } = require('express-validator');

dotenv.config();


exports.createGroup = async (req, res) => {
    const errors = validationResult(req);
    const start = Date.now();
    const clientIp = await getClientIp(req);
    console.log("Client IP:", clientIp);
    const logId = uuidv4();

    let locationData = { city: "Unknown" };

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        locationData = locationResponse.data;
    } catch (error) {
        logger.error("Error fetching location data", { error: error.message });
    }

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

        // Check if HospitalGroupID exists
        const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });

        if (!group) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1278;

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
            const errorCode = 1280;

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

        await fin_group.sync();

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
            hospitalGroupIDR
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
            userAgent: req.headers["user-agent"]
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
        const errorCode = 1281;

        logger.logWithMeta("error", "Error creating Fin group", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
            ...locationData,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating Fin group: " + error.message },
        });
    }
};
