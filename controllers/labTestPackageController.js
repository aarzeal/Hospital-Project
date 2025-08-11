const logger = require("../logger");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const Hospital = require("../models/HospitalModel.js");
const HospitalGroup = require("../models/HospitalGroup.js");

const { labTestPackageSchema } = require("../validators/joi-validator.js");
const { labTestPackagePOST, labTestPackageGET, labTestPackageFieldMap } = require("../dtos/LabTestPackageDTO.js");
const { createLabTestPackageDAO, getAllLabTestPackagesDAO, getLabTestPackageByIdDAO, updateLabTestPackageByIdDAO, deleteLabTestPackageByIdDAO, getLabTestPackageDataAsPerQueryParamDAO } = require("../Dao/LabTestPackageDAO.js");



exports.createLabTestPackage = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {

    const { error } = labTestPackageSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: req.body.hospitalGroupIDR },
    });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta(
        "error",
        "Invalid Hospital Group ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const RequestBody = {
      ...req.body,
      createdBy: username,
    };

    const labTestPackageData = labTestPackagePOST(RequestBody);
    const result = await createLabTestPackageDAO(req.sequelize, labTestPackageData);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab Test Package created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });

    res.status(201).json({
      message: "Lab Test Package created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: labTestPackageGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating Lab Test Package", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating Lab Test Package  : " + error.message },
    });
  }
};

exports.getAllLabTestPackage = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088;

      logger.logWithMeta("error", "Database connection not found", {
        errorCode,
        executionTime,
        hospitalName: req.hospitalName || "Unknown",
        ip: clientIp,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });

      return res.status(500).json({
        message: "Database connection not found",
        statusCode: 500,
        errorCode,
      });
    }
    const result = await getAllLabTestPackagesDAO(req.sequelize);
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Package successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(200).json({
      message: "All Lab Package Fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(labTestPackageGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Lab Test Package", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Lab Test Package: " + error.message },
    });
  }
};

exports.getLabTestPackageById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {

    const { id } = req.params;
    const result = await getLabTestPackageByIdDAO(req.sequelize, id);

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Lab Test Package not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });

      return res.status(404).json({
        errorCode: 1263,
        message: "Lab Test Package not found in Database",
        hospitalDatabase,
      });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Test Package successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      data: labTestPackageGET(result),
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching Lab Test Package", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1264,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      error: { message: "Error fetching Lab Test Package: " + error.message },
    });
  }
};

exports.updateLabTestPackage= async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
        const { error } = labTestPackageSchema.validate(req.body);
         if (error) return res.status(400).json({ error: error.details[0].message });

    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: req.body.hospitalGroupIDR },
    });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta(
        "error",
        "Invalid Hospital Group ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const { id } = req.params;

    const RequestBody = {
      ...req.body,
      updatedBy: username,
    };
    const labTestPackageData = labTestPackagePOST(RequestBody);

    const updated = await updateLabTestPackageByIdDAO(
      req.sequelize,
      id,
      labTestPackageData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab Test Package updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid Lab Test Package id, not found in DB", {
        errorCode,
        executionTime,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid Lab Test Package id, not found in DB",
      });
    }

    res.status(200).json({
      message: "Lab Test Package Updated Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: labTestPackageGET(updated),
    });
    
  } catch (error) { 
     const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9249;
  
      logger.logWithMeta("error", "Error updating Lab Test Package", {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      });
  
      res.status(500).json({
        meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
        error: { message: "Error updating Lab Test Package: " + error.message },
      });
  }
};

exports.deleteLabTestPackage = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;
  try {
    const deleted = await deleteLabTestPackageByIdDAO(req.sequelize, id);
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Lab Test Package id, not found in Database",
        {
          errorCode,
          executionTime,
          ID: req.params.id,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test Package id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab Test Package Deleted successfully", {
      executionTime,
      ID: req.params.id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Lab Test Package deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting Lab Test Package", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting Lab Test Package: " + error.message },
    });
  }
};

exports.getLabTestPackageByQueryParams = async (req, res) => {
    const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
  if (!req.sequelize) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9088;
  
        logger.logWithMeta("error", "Database connection not found", {
          errorCode,
          executionTime,
          hospitalName: req.hospitalName || "Unknown",
          ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });
  
        return res.status(500).json({
          message: "Database connection not found",
          statusCode: 500,
          errorCode,
        });
      }
  
      const { page, limit, ...queryFields } = req.query;
      const fieldMap = labTestPackageFieldMap;
  
      const ID_DTO_FIELD = "labTestPackageId"; // Ensure this matches your DTO
      const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];
  
      // Extract valid DTO fields from query params
      let requestedDtoFields = Object.keys(queryFields).filter(
        (field) => field in fieldMap
      );
      if (requestedDtoFields.length === 0) {
        requestedDtoFields = Object.keys(fieldMap);
      }
  
      // Always include the ID field
      if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
        requestedDtoFields.unshift(ID_DTO_FIELD);
      }
  
      // Map DTO fields to DB fields, remove duplicates
      const attributes = [
        ...new Set(requestedDtoFields.map((field) => fieldMap[field])),
      ];
  
      if (Object.keys(queryFields).length && attributes.length === 0) {
        return res.status(400).json({
          message: "Invalid or unknown fields in query parameters",
          statusCode: 400,
        });
      }
  
      // Pagination setup
      let pagination = {};
      let pageNum, limitNum;
      if (page && limit) {
        pageNum = parseInt(page);
        limitNum = parseInt(limit);
        if (!isNaN(pageNum) && !isNaN(limitNum)) {
          pagination.offset = (pageNum - 1) * limitNum;
          pagination.limit = limitNum;
        }
      }
  
      // Fetch data from DAO
      const { count: totalRecords, rows } =
        await getLabTestPackageDataAsPerQueryParamDAO(req.sequelize, {
          attributes,
          ...pagination,
        });
  
      const executionTime = `${Date.now() - start}ms`;
  
      logger.logWithMeta("info", "Fetched Lab Test Package successfully", {
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
  
      // Filter DTO output based on requested fields
      const responseData = rows.map((record) => {
        const fullDto = labTestPackageGET(record);
        const filteredDto = {};
        for (const key of requestedDtoFields) {
          if (key in fullDto) {
            filteredDto[key] = fullDto[key];
          }
        }
        return filteredDto;
      });
  
      // Build meta response
      const responseMeta = {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      };
  
      if (pageNum && limitNum) {
        responseMeta.pagination = {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limitNum),
        };
      }
  
      res.status(200).json({
        meta: responseMeta,
        data: responseData,
      });
    } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1263;
  
      logger.logWithMeta("error", "Error fetching Lab Test Package", {
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
        error: { message: "Error fetching Lab Test Package: " + error.message },
      });
    }
  };
  
