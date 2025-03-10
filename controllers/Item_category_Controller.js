const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const logger = require('../logger');

exports.createItemCategory = async (req, res) => {
    const start = Date.now();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    try {
        const { item_Category_name, item_Category_Code, is_PharamaItem, is_LabItem, purches_ledger_IDR, sale_ledger_IDR, discount_Allowed, hospital_IDR, hospitalGroup_IDR, createdBy } = req.body;
        const ItemCategory = require('../models/item-category-model')(req.sequelize);
        const Hospital = require('../models/HospitalModel');
        const HospitalGroup = require('../models/HospitalGroup');
        const Ledger = require('../models/AccLedger')(req.sequelize);
        
        // Validate foreign keys
        const hospitalExists = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
        if (!hospitalExists) {
            throw { errorCode: 9181, message: "Invalid hospital_IDR, not found in Hospital table" };
        }
        
        if (hospitalGroup_IDR) {
            const hospitalGroupExists = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
            if (!hospitalGroupExists) {
                throw { errorCode: 9182, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
            }
        }
        
        const purchaseLedgerExists = await Ledger.findOne({ where: { ledger_id: purches_ledger_IDR } });
        if (!purchaseLedgerExists) {
            throw { errorCode: 9183, message: "Invalid purches_ledger_IDR, not found in Ledger table" };
        }
        
        const saleLedgerExists = await Ledger.findOne({ where: { ledger_id: sale_ledger_IDR } });
        if (!saleLedgerExists) {
            throw { errorCode: 9184, message: "Invalid sale_ledger_IDR, not found in Ledger table" };
        }
        
        const newCategory = await ItemCategory.create({ item_Category_name, item_Category_Code, is_PharamaItem, is_LabItem, purches_ledger_IDR, sale_ledger_IDR, discount_Allowed, hospital_IDR, hospitalGroup_IDR, createdBy });
        
        logger.logWithMeta("info", "Item category created successfully", { logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method });
        
        return res.status(200).json({ message: "Item category created successfully", data: newCategory });
    } catch (error) {
        logger.logWithMeta("error", "Error in createItemCategory", { logId, errorCode: error.errorCode || 9185, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
        return res.status(400).json({ errorCode: error.errorCode || 9185, message: error.message });
    }
};


// exports.createItemCategory = async (req, res) => {
//     const start = Date.now();
//     const logId = uuidv4();
//     const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
//     try {
//         const { item_Category_name, item_Category_Code, is_PharamaItem, is_LabItem, purches_ledger_IDR, sale_ledger_IDR, discount_Allowed, hospital_IDR, hospitalGroup_IDR, createdBy } = req.body;
//         const ItemCategory = require('../models/item_category')(req.sequelize);
//         const Hospital = require('../models/hospital')(req.sequelize);
//         const HospitalGroup = require('../models/hospital_group')(req.sequelize);
//         const Ledger = require('../models/ledger')(req.sequelize);
        
//         // Validate foreign keys
//         const hospitalExists = await Hospital.findByPk(hospital_IDR);
//         if (!hospitalExists) {
//             throw { errorCode: 9180, message: "Invalid hospital_IDR, not found in Hospital table" };
//         }
        
//         if (hospitalGroup_IDR) {
//             const hospitalGroupExists = await HospitalGroup.findByPk(hospitalGroup_IDR);
//             if (!hospitalGroupExists) {
//                 throw { errorCode: 9181, message: "Invalid hospitalGroup_IDR, not found in HospitalGroup table" };
//             }
//         }
        
//         const purchaseLedgerExists = await Ledger.findByPk(purches_ledger_IDR);
//         if (!purchaseLedgerExists) {
//             throw { errorCode: 9182, message: "Invalid purches_ledger_IDR, not found in Ledger table" };
//         }
        
//         const saleLedgerExists = await Ledger.findByPk(sale_ledger_IDR);
//         if (!saleLedgerExists) {
//             throw { errorCode: 9183, message: "Invalid sale_ledger_IDR, not found in Ledger table" };
//         }
        
//         const newCategory = await ItemCategory.create({ item_Category_name, item_Category_Code, is_PharamaItem, is_LabItem, purches_ledger_IDR, sale_ledger_IDR, discount_Allowed, hospital_IDR, hospitalGroup_IDR, createdBy });
        
//         logger.logWithMeta("info", "Item category created successfully", { logId, executionTime: `${Date.now() - start}ms`, clientIp, apiName: req.originalUrl, method: req.method });
        
//         return res.status(201).json({ message: "Item category created successfully", data: newCategory });
//     } catch (error) {
//         logger.logWithMeta("error", "Error in createItemCategory", { logId, errorCode: error.errorCode || 9185, clientIp, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
//         return res.status(400).json({ errorCode: error.errorCode || 9184, message: error.message });
//     }
// };

exports.getAllItemCategories = async (req, res) => {
    const logId = uuidv4();
    try {
        const ItemCategory = require('../models/item_category')(req.sequelize);
        const categories = await ItemCategory.findAll();
        return res.status(200).json({ message: "Item categories fetched successfully", data: categories });
    } catch (error) {
        logger.logWithMeta("error", "Error fetching item categories", { logId, errorCode: 9187, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
        return res.status(500).json({ errorCode: 9187, message: "Error fetching item categories" });
    }
};

exports.getItemCategoryById = async (req, res) => {
    const logId = uuidv4();
    try {
        const { id } = req.params;
        const ItemCategory = require('../models/item_category')(req.sequelize);
        const category = await ItemCategory.findByPk(id);
        if (!category) {
            throw { errorCode: 9186, message: "Item category not found" };
        }
        return res.status(200).json({ message: "Item category fetched successfully", data: category });
    } catch (error) {
        logger.logWithMeta("error", "Error fetching item category", { logId, errorCode: error.errorCode || 9188, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
        return res.status(500).json({ errorCode: error.errorCode || 9188, message: "Error fetching item category" });
    }
};

exports.updateItemCategory = async (req, res) => {
    const logId = uuidv4();
    try {
        const { id } = req.params;
        const ItemCategory = require('../models/item_category')(req.sequelize);
        const category = await ItemCategory.findByPk(id);
        if (!category) {
            throw { errorCode: 9189, message: "Item category not found" };
        }
        await category.update(req.body);
        return res.status(200).json({ message: "Item category updated successfully", data: category });
    } catch (error) {
        logger.logWithMeta("error", "Error updating item category", { logId, errorCode: error.errorCode || 9190, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
        return res.status(500).json({ errorCode: error.errorCode || 9190, message: "Error updating item category" });
    }
};

exports.deleteItemCategory = async (req, res) => {
    const logId = uuidv4();
    try {
        const { id } = req.params;
        const ItemCategory = require('../models/item_category')(req.sequelize);
        const category = await ItemCategory.findByPk(id);
        if (!category) {
            throw { errorCode: 9191, message: "Item category not found" };
        }
        await category.destroy();
        return res.status(200).json({ message: "Item category deleted successfully" });
    } catch (error) {
        logger.logWithMeta("error", "Error deleting item category", { logId, errorCode: error.errorCode || 9192, apiName: req.originalUrl, method: req.method, errorMessage: error.message });
        return res.status(500).json({ errorCode: error.errorCode || 9192, message: "Error deleting item category" });
    }
};
