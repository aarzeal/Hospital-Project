const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const logger = require('../logger');
const { Op } = require('sequelize');
const getClientIp = require('../util/clientip.js');
const getLocationData = require("../util/locationHelper.js");

exports.createServiceSOR = async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        if (!Array.isArray(req.body) || req.body.length === 0) {
            throw { errorCode: 9231, message: "Request body must be a non-empty array." };
        }

        const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);
        const Hospital = require('../models/HospitalModel.js');
        const HospitalGroup = require('../models/HospitalGroup');
        const Service = require('../models/ser.js')(req.sequelize);
        const classidr = require('../models/Billing_Class.js')(req.sequelize);

        await ServiceSOR.sync({ force: false });

        // Validate and insert multiple records
        const results = await Promise.all(req.body.map(async (item) => {
            const {
                serviceRate, serviceIDR, firstEmergancyRate, secondEmergancyRate, classIDR,
                isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
                isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active,
            } = item;

            // Validate hospital
            const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
            if (!hospitalExists) {
                throw { errorCode: 9227, message: `Invalid hospital_IDR (${hospital_IDR}), not found in Hospital table` };
            }

            // Validate hospital group (if provided)
            if (hospitalGroup_IDR) {
                const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
                if (!hospitalGroupExists) {
                    throw { errorCode: 9228, message: `Invalid hospitalGroup_IDR (${hospitalGroup_IDR}), not found in HospitalGroup table` };
                }
            }

            // Validate service
            if (serviceIDR) {
                const service = await Service.findOne({ where: { service_id: serviceIDR } });
                if (!service) {
                    throw { errorCode: 9228, message: `Invalid service (${serviceIDR}), not found in service table` };
                }
            }

            // Validate classIDR
            if (classIDR) {
                const classIdr = await classidr.findOne({ where: { billing_Class_ID: classIDR } });
                if (!classIdr) {
                    throw { errorCode: 9228, message: `Invalid classIDR (${classIDR}), not found in class table` };
                }
            }

            // Insert record
            return await ServiceSOR.create({
                serviceRate, firstEmergancyRate, secondEmergancyRate, classIDR,
                isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
                isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active, serviceIDR,
                createdBy: req.username,
            });
        }));

        logger.logWithMeta("info", "ServiceSOR records created successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, city: locationData?.city,
            country: locationData?.country, apiName: req.originalUrl, method: req.method, CreatedBy: req.username, UpdatedBy: req.username
        });

        return res.status(200).json({ message: "ServiceSOR records created successfully", data: results });

    } catch (error) {
        logger.logWithMeta("error", "Error in createServiceSOR", {
            logId, errorCode: error.errorCode || 9229, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, city: locationData?.city,
            country: locationData?.country, method: req.method, errorMessage: error.message, CreatedBy: req.username, UpdatedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9230, message: error.message });
    }
};


// exports.createServiceSOR = async (req, res) => {
//     const errors = validationResult(req);


//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
    
//     const start = Date.now();
//     const logId = uuidv4();
//     // const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     const clientIp = await getClientIp(req);
//     const locationData = await getLocationData(clientIp);

//     try {
//         const {
//             serviceRate,serviceIDR, firstEmergancyRate, secondEmergancyRate, classIDR,
//             isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
//             isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active,
//         } = req.body;

//         const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);
//         const Hospital = require('../models/HospitalModel.js');
//         const HospitalGroup = require('../models/HospitalGroup');

//         const Service = require('../models/ser.js')(req.sequelize);
//         const classidr = require('../models/Billing_Class.js')(req.sequelize);

//         await ServiceSOR.sync({ force: false });

//         const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
//         if (!hospitalExists) {
//             throw { errorCode: 9227, message: "Invalid hospital_IDR, not found in Hospital table" };
//         }

//         if (hospitalGroup_IDR) {
//             const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
//             if (!hospitalGroupExists) {
//                 throw { errorCode: 9228, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
//             }
//         }
//         if (serviceIDR) {
//             const service = await Service.findOne({ where: { service_id: serviceIDR } });
//             if (!service) {
//                 throw { errorCode: 9228, message: "Invalid service, not found in service table" };
//             }
//         }
//         if (classIDR) {
//             const classIdr = await classidr.findOne({ where: { billing_Class_ID: classIDR } });
//             if (!classIdr) {
//                 throw { errorCode: 9228, message: "Invalid classIDR, not found in class table" };
//             }
//         }

//         const newServiceSOR = await ServiceSOR.create({
//             serviceRate, firstEmergancyRate, secondEmergancyRate, classIDR,
//             isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
//             isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active,serviceIDR,
//             createdBy: req.username,
//         });

//         logger.logWithMeta("info", "ServiceSOR created successfully", {
//             logId, executionTime: `${Date.now() - start}ms`, clientIp,  city: locationData?.city,
//             country: locationData?.country,apiName: req.originalUrl, method: req.method, CreatedBy: req.username, UpdatedBy: req.username
//         });

//         return res.status(200).json({ message: "ServiceSOR created successfully", data: newServiceSOR });

//     } catch (error) {
//         logger.logWithMeta("error", "Error in createServiceSOR", {
//             logId, errorCode: error.errorCode || 9229, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, city: locationData?.city,
//             country: locationData?.country, method: req.method, errorMessage: error.message, CreatedBy: req.username, UpdatedBy: req.username
//         });

//         return res.status(400).json({ errorCode: error.errorCode || 9230, message: error.message });
//     }
// };
exports.getServiceSOR = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);

        const serviceSORRecords = await ServiceSOR.findAll();

        if (!serviceSORRecords.length) {
            throw { errorCode: 9231, message: "No ServiceSOR records found" };
        }

        logger.logWithMeta("info", "ServiceSOR records retrieved successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, city: locationData?.city,
            country: locationData?.country, apiName: req.originalUrl, method: req.method,
            RetrievedBy: req.username
        });

        return res.status(200).json({ message: "ServiceSOR records retrieved successfully", data: serviceSORRecords });

    } catch (error) {
        logger.logWithMeta("error", "Error in getServiceSOR", {
            logId, errorCode: error.errorCode || 9232, executionTime: `${Date.now() - start}ms`,
            clientIp, city: locationData?.city, country: locationData?.country,
            apiName: req.originalUrl, method: req.method, errorMessage: error.message, RetrievedBy: req.username
        });

        return res.status(400).json({ errorCode: error.errorCode || 9233, message: error.message });
    }
};

exports.getServiceSORById = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { serviceSOR_ID } = req.params;
        const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);

        const serviceSORRecord = await ServiceSOR.findOne({ where: { serviceSOR_ID } });

        if (!serviceSORRecord) {
            throw { errorCode: 9234, message: "ServiceSOR record not found" };
        }

        logger.logWithMeta("info", "ServiceSOR record retrieved successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, city: locationData?.city,
            country: locationData?.country, apiName: req.originalUrl, method: req.method,
            RetrievedBy: req.username, serviceSORId: serviceSOR_ID
        });

        return res.status(200).json({ message: "ServiceSOR record retrieved successfully", data: serviceSORRecord });

    } catch (error) {
        logger.logWithMeta("error", "Error in getServiceSORById", {
            logId, errorCode: error.errorCode || 9235, executionTime: `${Date.now() - start}ms`,
            clientIp, city: locationData?.city, country: locationData?.country,
            apiName: req.originalUrl, method: req.method, errorMessage: error.message,
            RetrievedBy: req.username, serviceSORId: req.params.id
        });

        return res.status(400).json({ errorCode: error.errorCode || 9236, message: error.message });
    }
};
exports.updateServiceSOR = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const start = Date.now();
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { serviceSOR_ID } = req.params;
        const {
            serviceRate, serviceIDR, firstEmergancyRate, secondEmergancyRate, classIDR,
            isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
            isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active,
        } = req.body;

        const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);

        const existingRecord = await ServiceSOR.findOne({ where: { serviceSOR_ID } });

        if (!existingRecord) {
            throw { errorCode: 9237, message: "ServiceSOR record not found" };
        }

        await existingRecord.update({
            serviceRate, serviceIDR, firstEmergancyRate, secondEmergancyRate, classIDR,
            isNotApplicable, fromDate, toDate, isEffectiveNow, versionNumber,
            isCashPriceList, hospital_IDR, hospitalGroup_IDR, Non_Active,
            updatedBy: req.username
        });

        logger.logWithMeta("info", "ServiceSOR record updated successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, city: locationData?.city,
            country: locationData?.country, apiName: req.originalUrl, method: req.method,
            UpdatedBy: req.username, serviceSORId: serviceSOR_ID
        });

        return res.status(200).json({ message: "ServiceSOR record updated successfully", data: existingRecord });

    } catch (error) {
        logger.logWithMeta("error", "Error in updateServiceSOR", {
            logId, errorCode: error.errorCode || 9238, executionTime: `${Date.now() - start}ms`,
            clientIp, city: locationData?.city, country: locationData?.country,
            apiName: req.originalUrl, method: req.method, errorMessage: error.message,
            UpdatedBy: req.username, serviceSORId: req.params.id
        });

        return res.status(400).json({ errorCode: error.errorCode || 9239, message: error.message });
    }
};

exports.deleteServiceSOR = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = await getClientIp(req);
    const locationData = await getLocationData(clientIp);

    try {
        const { serviceSOR_ID } = req.params;
        const ServiceSOR = require('../models/ServiceSOR.js')(req.sequelize);

        const existingRecord = await ServiceSOR.findOne({ where: { serviceSOR_ID } });

        if (!existingRecord) {
            throw { errorCode: 9240, message: "ServiceSOR record not found" };
        }

        await existingRecord.destroy();

        logger.logWithMeta("info", "ServiceSOR record deleted successfully", {
            logId, executionTime: `${Date.now() - start}ms`, clientIp, city: locationData?.city,
            country: locationData?.country, apiName: req.originalUrl, method: req.method,
            DeletedBy: req.username, serviceSORId: serviceSOR_ID
        });

        return res.status(200).json({ message: "ServiceSOR record deleted successfully" });

    } catch (error) {
        logger.logWithMeta("error", "Error in deleteServiceSOR", {
            logId, errorCode: error.errorCode || 9241, executionTime: `${Date.now() - start}ms`,
            clientIp, city: locationData?.city, country: locationData?.country,
            apiName: req.originalUrl, method: req.method, errorMessage: error.message,
            DeletedBy: req.username, serviceSORId: req.params.id
        });

        return res.status(400).json({ errorCode: error.errorCode || 9242, message: error.message });
    }
};
