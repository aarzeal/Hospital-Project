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

// exports.getInvProductCompanyByCustomQueryParam= async(req,res)=>{
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);

//   try {
//         const Company = require("../models/InvProdCompany.js")(req.sequelize);
//     const { InvProductID, page, limit,...queryColumns } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const offset = (pageNum - 1) * limitNum;

//     let attributes = Object.keys(queryColumns);
//     if (!attributes.includes("InvProductID")) {
//       attributes.push("InvProductID");
//     }

//    if (attributes.length === 1 && attributes[0] === "InvProductID") {
//       attributes = undefined;
//     }
//     let data, totalRecords;
//     const queryKeys = Object.keys(req.query);
//     const filterKeys = queryKeys.filter(
//       (key) => key !== "page" && key !== "limit"
//     );

//    if (InvProductID) {
//          data = await Company.findOne({
//            where: { InvProductID },
//            attributes,
//          });
//          if (!data) {
//            const executionTime = `${Date.now() - start}ms`;
//            const errorCode = 2123;
//            logger.logWithMeta("error", "Company not found", {
//              errorCode,
//              executionTime,
//              hospitalId: req.hospitalName,
//              apiName: req.originalUrl,
//              city: locationData?.city,
//              country: locationData?.country,
//              method: req.method,
//              userAgent: req.headers["user-agent"],
//              createdBy: req.username,
//              updatedBy: req.username,
//            });
//             return res
//           .status(404)
//           .json({ errorCode, message: "Company Not Found" });
//       }
//     } else{
//         const isPagination=req.query.page && req.query.limit;
//       if(filterKeys.length===0){
//         if(isPagination){
//           totalRecords=await Company.count();
//           data= await Company.findAll({
//             offset,
//             limit: limitNum,
//             attributes,
//             order:[['InvProductID','ASC']],
//           });
//         }else{
//           data=await Company.findAll({
//             attributes,
//             order:[['InvProductID','ASC']],
//           });
//           totalRecords=data.length;
//         }
//       }else{
//          if(isPagination){
//           totalRecords=await Company.count();
//           data= await Company.findAll({
//             offset,
//             limit: limitNum,
//             attributes,
//             order:[['InvProductID','ASC']],
//           });
//         }else{
//           data=await Company.findAll({
//             attributes,
//             order:[['InvProductID','ASC']],
//           });
//           totalRecords=data.length;
//         }
//       }
//     }

// const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Fetched Company Successfully",{
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       updatedBy: req.username,
//     });

//     const formatData = (record) => {
//       const obj = record.toJSON();
//       const { InvProductID, ...rest } = obj;
//       return {InvProductID, ...rest };
//     };

//     const formattedData = Array.isArray(data)
//       ? data.map(formatData)
//       : data
//       ? formatData(data)
//       : null;

//     const meta = {
//       statusCode: 200,
//       executionTime,
//       hospitalDatabase,
//     };

//     if (!InvProductID && req.query.page && req.query.limit) {
//       meta.pagination = {
//         page: pageNum,
//         limit: limitNum,
//         totalRecords,
//         totalPages: Math.ceil(totalRecords / limitNum),
//       };
//     }

//     res.status(200).json({
//       meta,
//       data: formattedData,
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1263;

//     logger.logWithMeta("error", "Error fetching Company data", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       updatedBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error fetching Company: " + error.message },
//     });
//   }
 
// }

exports.getInvProductCompanyByCustomQueryParam = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const Company = require("../models/InvProdCompany.js")(req.sequelize);
    const { InvProductID, page, limit, ...queryColumns } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // PUBLIC-TO-PRIVATE COLUMN MAPPING
    const columnMap = {
      Name: "CompanyName",
      code: "CompanyCode",
      address: "City",
      phone: "Mobile",
      EmailID:"Email",
      // Add more public => db field mappings here
    };

    const reverseColumnMap = Object.fromEntries(
      Object.entries(columnMap).map(([publicKey, dbKey]) => [dbKey, publicKey])
    );

    // Extract only valid DB field names from query parameters
    let attributes = Object.keys(queryColumns)
      .map((key) => columnMap[key])
      .filter(Boolean);

    // Always include InvProductID
    if (!attributes.includes("InvProductID")) {
      attributes.push("InvProductID");
    }

    // If no valid fields selected, get full data
    if (attributes.length === 1 && attributes[0] === "InvProductID") {
      attributes = undefined;
    }

    let data, totalRecords;
    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter((key) => key !== "page" && key !== "limit");

    if (InvProductID) {
      data = await Company.findOne({
        where: { InvProductID },
        attributes,
      });
      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 2123;
        logger.logWithMeta("error", "Company not found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });
        return res.status(404).json({ errorCode, message: "Company Not Found" });
      }
    } else {
      const isPagination = req.query.page && req.query.limit;
      if (filterKeys.length === 0) {
        totalRecords = isPagination ? await Company.count() : null;
        data = await Company.findAll({
          offset: isPagination ? offset : undefined,
          limit: isPagination ? limitNum : undefined,
          attributes,
          order: [["InvProductID", "ASC"]],
        });
        totalRecords = isPagination ? totalRecords : data.length;
      } else {
        totalRecords = isPagination ? await Company.count() : null;
        data = await Company.findAll({
          offset: isPagination ? offset : undefined,
          limit: isPagination ? limitNum : undefined,
          attributes,
          order: [["InvProductID", "ASC"]],
        });
        totalRecords = isPagination ? totalRecords : data.length;
      }
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Company Successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    // FORMAT RESPONSE TO PUBLIC KEYS
    const formatData = (record) => {
      const obj = record.toJSON();
      const result = {};

      for (const [key, value] of Object.entries(obj)) {
        const publicKey = reverseColumnMap[key] || key;
        result[publicKey] = value;
      }

      return result;
    };

    const formattedData = Array.isArray(data)
      ? data.map(formatData)
      : data
      ? formatData(data)
      : null;

    const meta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (!InvProductID && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }

    res.status(200).json({
      meta,
      data: formattedData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Company data", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Company: " + error.message },
    });
  }
};

