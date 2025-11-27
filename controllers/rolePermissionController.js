const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { rolepermission } = require("../validators/joi-validator");
const { rolePermissionPOST, rolePermissionGET, rolePermissionMap } = require("../dtos/RolePermissionDTO");
const { createRolePermissionDAO, getAllRolePermissionsDAO, getRolePermissionByIdDAO, updateRolePermissionByIdDAO, deleteRolePermissionByIdDAO, getRolePermissionDataAsPerQueryParamDAO } = require("../Dao/RolePermissionDAO");

exports.createRolePermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { error } = rolepermission.validate(req.body);
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

    const rolepermissionData = rolePermissionPOST(RequestBody);
    const result = await createRolePermissionDAO(
      req.sequelize,
      rolepermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission created successfully", {
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
      message: "Role Permission created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: rolePermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Creating Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Creating Role Permission: " + error.message },
    });
  }
};

exports.getAllRolePermissions = async (req, res) => {
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
    const result = await getAllRolePermissionsDAO(req.sequelize);
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Roles Permissions successfully", {
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
      message: "All Roles Permissions Fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(rolePermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Permission: " + error.message },
    });
  }
};

exports.getRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;
    const result = await getRolePermissionByIdDAO(req.sequelize, id);

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Role Permission not found", {
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
        message: "Role Permission not found in Database",
        hospitalDatabase,
      });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Permission successfully", {
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
      data: rolePermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role: " + error.message },
    });
  }
};

exports.updateRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
    const { error } = rolepermission.validate(req.body);
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
    const rolepermissionData = rolePermissionPOST(RequestBody);

    const updated = await updateRolePermissionByIdDAO(
      req.sequelize,
      id,
      rolepermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Role Permission id, not found in DB",
        {
          errorCode,
          executionTime,
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
        message: "Invalid Role Permission id, not found in DB",
      });
    }

    res.status(200).json({
      message: "Role Updated Permission Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: rolePermissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Updating Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Updating Role Permission: " + error.message },
    });
  }
};

exports.deleteRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;
  try {
    const deleted = await deleteRolePermissionByIdDAO(req.sequelize, id);
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Role Permission id, not found in Database",
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
        message: "Invalid Role Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission Deleted successfully", {
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
      message: "Role Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting Role Permission: " + error.message },
    });
  }
};

exports.getRolePermissionByQueryParams = async (req, res) => {
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
    const fieldMap = rolePermissionMap;

    const ID_DTO_FIELD = "rolePermissionId"; // Ensure this matches your DTO
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
      await getRolePermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Permission successfully", {
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
      const fullDto = rolePermissionGET(record);
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
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Permission: " + error.message },
    });
  }
};
