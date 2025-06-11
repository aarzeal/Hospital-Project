const logger = require("../logger");
const LabTestDao = require("../Dao/LabTestDao");
const dto = require("../dtos/LabTestDTO");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const Hospital = require("../models/HospitalModel");
const HospitalGroup = require("../models/HospitalGroup");
const {labtestschema} = require("../validators/joi-validator");

exports.createLabTest = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { error } = labtestschema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const Labtestmethod = require("../models/LabTestMethodModel")(req.sequelize);
    const labTestMethod = await Labtestmethod.findOne({
      where: { lab_test_method_id: req.body.labTestMethodIDR },
    });
    if (!labTestMethod) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 5454;
      logger.logWithMeta("error", "Invalid Lab Test Method ID, not found in Database", {
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
      return res.status(400).json({
        errorCode,
        message: "Invalid Lab Test Method ID, not found in Database",
      });
    }
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

    const labtestData = dto.toLabTestPOST(RequestBody);

    const result = await LabTestDao.createLabTestDao(
      req.sequelize,
      labtestData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test created successfully", {
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
      message: "Lab test created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: dto.toLabTestEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating Lab Test", {
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
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error creating Lab Test: " + error.message },
    });
  }
};

exports.getAllLabTest = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088; // Database connection error

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

    const result = await LabTestDao.getAllLabTestDAO(req.sequelize);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Test successfully", {
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
        executionTime,
        hospitalDatabase,
      },
      data: result.map(dto.toLabTestEntity),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Lab Tests", {
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
      error: { message: "Error fetching Lab Test: " + error.message },
    });
  }
};

exports.getLabTestById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const { id } = req.params;
    const result = await LabTestDao.getLabTestByIdDAO(req.sequelize, id);

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Lab test not found", {
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

      return res
        .status(404)
        .json({ errorCode: 1263, message: "Lab Test not found" });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched lab test successfully", {
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
      data: dto.toLabTestEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching lab test", {
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
      error: { message: "Error fetching lab test: " + error.message },
    });
  }
};

exports.updateLabTestById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
    const { error } = labtestschema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const Labtestmethod = require("../models/LabTestMethodModel")(req.sequelize);
    const labTestMethod = await Labtestmethod.findOne({
      where: { lab_test_method_id: req.body.labTestMethodIDR },
    });
    if (!labTestMethod) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 5454;
      logger.logWithMeta("error", "Invalid Lab Test Method ID, not found in Database", {
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
      return res.status(400).json({
        errorCode,
        message: "Invalid Lab Test Method ID, not found in Database",
      });
    }
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
          updatedBy: username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const { lab_test_id } = req.params;
    const RequestBody = {
      ...req.body,
      updatedBy: username,
    };
    const labtestData = dto.toLabTestPOST(RequestBody);
    const updated = await LabTestDao.updateLabTestByIdDAO(req.sequelize, lab_test_id, labtestData);
    // dto.toLabTestPOST(req.body,req.username)
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
      updatedBy: username,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid lab test id, not found in DB", {
        errorCode,
        executionTime,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        updatedBy: username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in DB",
      });
    }

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: dto.toLabTestEntity(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating lab test", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating lab test : " + error.message },
    });
  }
};

exports.deleteLabTestById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { lab_test_id } = req.params;
  try {
    const deleted = await LabTestDao.deleteLabTestByIdDAO(req.sequelize, lab_test_id);
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid lab test id, not found in Database",
        {
          errorCode,
          executionTime,
          ID: req.params.lab_test_id,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          // updatedBy:req.username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in Database",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test DELETED successfully", {
      executionTime,
      ID: req.params.lab_test_id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Lab test deleted successfully",
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating lab test", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating lab test : " + error.message },
    });
  }
};

exports.getLabTestAsPerQueryParam = async (req, res) => {
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
    const fieldMap = dto.labTestFieldMap;

    const ID_DTO_FIELD = "labTestId"; // Ensure this matches your DTO
    const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];

    // Extract valid DTO fields from query params
    let requestedDtoFields = Object.keys(queryFields).filter(field => field in fieldMap);
     if (requestedDtoFields.length === 0) {
      requestedDtoFields = Object.keys(fieldMap);
}

    // Always include the ID field
    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    // Map DTO fields to DB fields, remove duplicates
    const attributes = [...new Set(requestedDtoFields.map(field => fieldMap[field]))];

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
    const { count: totalRecords, rows } = await LabTestDao.getLabTestAsPerQueryParamDAO(
      req.sequelize,
      {
        attributes,
        ...pagination,
      }
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Test successfully", {
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
    const responseData = rows.map(record => {
      const fullDto = dto.toLabTestEntity(record);
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

    logger.logWithMeta("error", "Error fetching Lab Test", {
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
      error: { message: "Error fetching Lab Test: " + error.message },
    });
  }
};

