const logger = require("../logger");

const {
  createPermissionDAO,
  getAllPermissionsDAO,
  getPermissionByIdDAO,
  updatePermissionByIdDAO,
  deletePermissionByIdDAO,
  getPermissionDataAsPerQueryParamDAO,
} = require("../Dao/PermissionDAO");

const {
  permissionPOST,
  permissionGET,
  permissionMap,
} = require("../dtos/PermissionDTO");

const { permissionValidator } = require("../validators/joi-validator");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");

// Create Permission
exports.createPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const username = req.username;

  try {
    const { error } = permissionValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const RequestBody = { ...req.body, createdBy: username };
    const permissionData = permissionPOST(RequestBody);

    const result = await createPermissionDAO(req.sequelize, permissionData);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Permission created successfully", {
      executionTime,
      apiName: req.originalUrl,
      ip: clientIp,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });

    res.status(201).json({
      message: "Permission created successfully",
      meta: { statusCode: 200, executionTime },
      data: permissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Creating Permission", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Creating Permission: " + error.message },
    });
  }
};

// Get All Permissions
exports.getAllPermissions = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const result = await getAllPermissionsDAO(req.sequelize);
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Permissions successfully", {
      executionTime,
      apiName: req.originalUrl,
      ip: clientIp,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(200).json({
      message: "All Permissions Fetched successfully",
      meta: { statusCode: 200, executionTime },
      data: result.map(permissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Permissions", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Fetching Permissions: " + error.message },
    });
  }
};

// Get Permission By ID
exports.getPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;
    const result = await getPermissionByIdDAO(req.sequelize, id);

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Permission not found", {
        errorCode,
        executionTime,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });

      return res.status(404).json({
        errorCode: 1263,
        message: "Permission not found in Database",
      });
    }

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched Permission successfully", {
      executionTime,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      data: permissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Permission", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Fetching Permission: " + error.message },
    });
  }
};

// Update Permission
exports.updatePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const username = req.username;

  try {
    const { error } = permissionValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const RequestBody = { ...req.body, updatedBy: username };
    const permissionData = permissionPOST(RequestBody);

    const updated = await updatePermissionByIdDAO(req.sequelize, id, permissionData);

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid Permission id, not found in DB", {
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
        message: "Invalid Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Permission updated successfully", {
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      message: "Permission Updated Successfully",
      meta: { statusCode: 200, executionTime },
      data: permissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Updating Permission", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Updating Permission: " + error.message },
    });
  }
};

// Delete Permission
exports.deletePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const { id } = req.params;

  try {
    const deleted = await deletePermissionByIdDAO(req.sequelize, id);

    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid Permission id, not found in DB", {
        errorCode,
        executionTime,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      });

      return res.status(400).json({
        errorCode,
        message: "Invalid Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Permission deleted successfully", {
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting Permission", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Deleting Permission: " + error.message },
    });
  }
};

// Get Permissions by Query Params with Pagination
exports.getPermissionByQueryParams = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const { page, limit, ...queryFields } = req.query;
    const fieldMap = permissionMap;

    const ID_DTO_FIELD = "permissionId";
    const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];

    let requestedDtoFields = Object.keys(queryFields).filter(
      (field) => field in fieldMap
    );

    if (requestedDtoFields.length === 0) {
      requestedDtoFields = Object.keys(fieldMap);
    }

    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    const attributes = [...new Set(requestedDtoFields.map((field) => fieldMap[field]))];

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

    const { count: totalRecords, rows } =
      await getPermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Permissions successfully", {
      executionTime,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    const responseData = rows.map((record) => {
      const fullDto = permissionGET(record);
      const filteredDto = {};
      for (const key of requestedDtoFields) {
        if (key in fullDto) filteredDto[key] = fullDto[key];
      }
      return filteredDto;
    });

    const responseMeta = { statusCode: 200, executionTime };
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

    logger.logWithMeta("error", "Error Fetching Permissions", {
      errorCode,
      executionTime,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Fetching Permissions: " + error.message },
    });
  }
};
