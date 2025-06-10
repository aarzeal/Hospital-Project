const { toProductEntity } = require("../dtos/LabTestMethodDTO");
const logger = require("../logger");
const LabTestMethodDao = require("../Dao/LabTestMethodDao");
const dto = require("../dtos/LabTestMethodDTO");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const Hospital = require("../models/HospitalModel");
const HospitalGroup = require("../models/HospitalGroup");

exports.createLabTestMethod = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
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
    const labtestmethodData = dto.toLabTestMethodPOST(RequestBody);

    const result = await LabTestMethodDao.createLabTestMethodDao(
      req.sequelize,
      labtestmethodData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test method created successfully", {
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
      message: "Lab test method created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: dto.toLabTestMethodEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating Lab Test Method", {
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
      meta: { statusCode: 500, errorCode, executionTime,hospitalDatabase },
      error: { message: "Error creating Lab Test Method: " + error.message },
    });
  }
};

exports.getAllLabTestMethod = async (req, res) => {
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

    const result = await LabTestMethodDao.getAllLabTestMethodDAO(req.sequelize);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Test Methods successfully", {
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
      message: "All Lab test methods Feached successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(dto.toLabTestMethodEntity),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Lab Test Method", {
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
      error: { message: "Error fetching Lab Test Methods: " + error.message },
    });
  }
};

exports.getLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const { id } = req.params;
    const result = await LabTestMethodDao.getLabTestMethodByIdDAO(
      req.sequelize,
      id
    );

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Lab test method not found", {
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
        .json({ errorCode: 1263, message: "Lab test method not found in Database",hospitalDatabase });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched lab test method successfully", {
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
      data: dto.toLabTestMethodEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching lab test method", {
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
      error: { message: "Error fetching lab test method: " + error.message },
    });
  }
};

exports.updateLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username =req.username;
  try {
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
          updatedBy: username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const RequestBody={
      ...req.body,
      updatedBy:username,
    }

    const updated = await LabTestMethodDao.updateLabTestMethodByIdDAO(
      req.sequelize,
      req.params.lab_test_method_id,
      dto.toLabTestMethodPOST(RequestBody)
    );
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test method updated successfully", {
      ID: req.params.lab_test_method_id,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid lab test method id, not found in DB", {
        errorCode,
        executionTime,
        ID: req.params.lab_test_method_id,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test method id, not found in DB",
      });
    }

    res.status(200).json({
      message:"LabTestMethod Updated Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: dto.toLabTestMethodEntity(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating lab test method", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating lab test method: " + error.message },
    });
  }
};

exports.deleteLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { lab_test_method_id } = req.params;
  try {
    const deleted = await LabTestMethodDao.deleteLabTestMethodByIdDAO(
      req.sequelize,
      lab_test_method_id
    );
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid lab test method id, not found in Database", {
        errorCode,
        executionTime,
        ID: req.params.lab_test_method_id,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test method Deleted successfully", {
      executionTime,
      ID: req.params.lab_test_method_id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Lab test method deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting lab test method", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting lab test method: " + error.message },
    });
  }
};

exports.getCustomDataAsPerQueryParam = async (req, res) => {
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
    const fieldMap = dto.labTestMethodFieldMap;

    const ID_DTO_FIELD = "labTestMethodId";

    let requestedDtoFields = Object.keys(queryFields).filter(field => field in fieldMap);
    if (requestedDtoFields.length === 0) {
  requestedDtoFields = Object.keys(fieldMap);
}
    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    const attributes = [...new Set(requestedDtoFields.map(dtoField => fieldMap[dtoField]))];

    if (Object.keys(queryFields).length && attributes.length === 0) {
      return res.status(400).json({
        message: "Invalid or unknown fields in query parameters",
        statusCode: 400,
      });
    }

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

    const { count: totalRecords, rows } = await LabTestMethodDao.getCustomDataAsPerQueryParamDAO(
      req.sequelize,
      {
        attributes,
        ...pagination,
      }
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Lab Test Methods successfully", {
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

    const responseData = rows.map(record => {
      const fullDto = dto.toLabTestMethodEntity(record);
      const filteredDto = {};
      for (const key of requestedDtoFields) {
        if (key in fullDto) {
          filteredDto[key] = fullDto[key];
        }
      }
      return filteredDto;
    });

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

    logger.logWithMeta("error", "Error fetching Lab Test Method", {
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
      error: { message: "Error fetching Lab Test Methods: " + error.message },
    });
  }
};
