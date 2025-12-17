const logger = require("../logger");

const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { userPermissionPOST, userPermissionGET, userPermissionMap } = require("../dtos/UserPermissionDTO");
const { createUserPermissionDAO, getAllUserPermissionsDAO, getUserPermissionByIdDAO, updateUserPermissionByIdDAO, deleteUserPermissionByIdDAO, getUserPermissionDataAsPerQueryParamDAO, checkDuplicateUserPermissionDAO, getPermissionsByUserAndSubmoduleDAO, bulkCreateUserPermissionsDAO, getPermissionsByUserIdDAO, toggleUserPermissionStatusDAO } = require("../Dao/UserPermissionDAO");
const { userPermissionBulkSchema, userPermission }=require("../validators/joi-validator")


exports.createUserPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  const username = req.username;

  try {
    const { userId, submoduleId, permissionId, hospitalIDR, hospitalGroupIDR } = req.body;

    if (!userId || !submoduleId || !permissionId) {
      return res.status(400).json({ message: "userId, submoduleId, and permissionId are required" });
    }

    // Check duplicate
    const existing = await checkDuplicateUserPermissionDAO(
      req.sequelize,
      userId,
      submoduleId,
      permissionId
    );
    if (existing) {
      return res.status(400).json({ message: "Permission already assigned to this user" });
    }

    // Prepare DTO
    const data = userPermissionPOST({
      ...req.body,
      isActive: 1,
      createdBy: username,
      updatedBy: username,
    });

    const created = await createUserPermissionDAO(req.sequelize, data);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "User Permission created successfully", {
      executionTime,
      hospitalDatabase,
      userId,
      apiName: req.originalUrl,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });

    res.status(201).json({
      meta: { statusCode: 201, executionTime, hospitalDatabase },
      data: userPermissionGET(created),
      message: "User Permission added successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error creating user permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating user permission: " + error.message },
    });
  }
};

exports.bulkCreateUserPermissions = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    // ---------- STEP 0 : Validate Request Body ----------
    const { error } = userPermissionBulkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const allRequestedSubmodules = [];
    const validationErrors = [];

    // ---------- STEP 1 : Validate Hospitals & Submodules ----------
    for (const item of req.body) {
      const { userId, submodules } = item;

      if (!submodules || submodules.length === 0) continue;

      const firstHospitalIDR = submodules[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({ userId, error: "HospitalIDR is required" });
        continue;
      }

      const hospital = await Hospital.findOne({ where: { HospitalID: firstHospitalIDR } });
      if (!hospital) {
        validationErrors.push({ userId, error: "Invalid HospitalID" });
        continue;
      }

      const firstHospitalGroupIDR = submodules[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({ where: { HospitalGroupID: firstHospitalGroupIDR } });
        if (!group) {
          validationErrors.push({ userId, error: "Invalid HospitalGroupID" });
          continue;
        }
      }

      // Collect submodules
      submodules.forEach((sub) => {
        allRequestedSubmodules.push({
          userId,
          submoduleId: sub.submoduleId,
          permissionId: sub.permissionId,
          isActive: sub.isActive ?? true,
          hospitalIDR: sub.hospitalIDR,
          hospitalGroupIDR: sub.hospitalGroupIDR,
        });
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors found",
        errors: validationErrors,
      });
    }

    // ---------- STEP 2 : Check Existing Permissions ----------
    const newPermissions = [];

    for (const sub of allRequestedSubmodules) {
      const existing = await getPermissionsByUserAndSubmoduleDAO(
        req.sequelize,
        sub.userId,
        sub.submoduleId
      );

      // Only add if not already exists
      const exists = existing.some(
        (r) => r.permission_id === sub.permissionId
      );

      if (!exists) {
        newPermissions.push(
          userPermissionPOST({
            userId: sub.userId,
            submoduleId: sub.submoduleId,
            permissionId: sub.permissionId,
            isActive: sub.isActive,
            hospitalIDR: sub.hospitalIDR,
            hospitalGroupIDR: sub.hospitalGroupIDR,
            createdBy: username,
            updatedBy: username,
          })
        );
      }
    }

    // ---------- STEP 3 : If nothing new, return success ----------
    if (newPermissions.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      return res.status(200).json({
        message: "No new user permissions to add",
        meta: {
          statusCode: 200,
          executionTime,
          hospitalDatabase,
          totalReceived: allRequestedSubmodules.length,
          totalInserted: 0,
        },
        data: [],
      });
    }

    // ---------- STEP 4 : Bulk Insert ----------
    const results = await bulkCreateUserPermissionsDAO(req.sequelize, newPermissions);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "User Permissions added (new only)", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      count: results.length,
      createdBy: username,
    });

    const responseData = results.map(userPermissionGET);

    res.status(201).json({
      message: "User Permissions created successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
        totalReceived: allRequestedSubmodules.length,
        totalInserted: results.length,
      },
      data: responseData,
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;

    logger.logWithMeta("error", "Error Creating User Permissions in bulk", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Creating User Permissions: " + error.message },
    });
  }
};


exports.getAllUserPermissions = async (req, res) => {
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

    // 🟢 Call DAO
    const result = await getAllUserPermissionsDAO(req.sequelize);

    const executionTime = `${Date.now() - start}ms`;

    // 🟢 Log success
    logger.logWithMeta("info", "Fetched UserPermissions successfully", {
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

    // 🟢 Send response
    return res.status(200).json({
      message: "All UserPermissions fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(userPermissionGET),
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    // 🔴 Log error
    logger.logWithMeta("error", "Error Fetching UserPermissions", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching UserPermissions: " + error.message },
    });
  }
};

exports.getUserPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;

    const result = await getUserPermissionByIdDAO(req.sequelize, id);

    // 🔴 Not Found case (Same style as Role not found)
    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "User Permission not found", {
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

      return res.status(404).json({
        errorCode: 1263,
        message: "User Permission not found in Database",
        hospitalDatabase,
      });
    }

    // 🟢 Success Log
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched User Permission successfully", {
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

    // 🟢 Response
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: userPermissionGET(result),
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    // 🔴 Error log
    logger.logWithMeta("error", "Error Fetching User Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching User Permission: " + error.message },
    });
  }
};

// GET /user-permissions/user/:userId
exports.getPermissionsByUserId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const permissions = await getPermissionsByUserIdDAO(req.sequelize, userId);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched User Permissions successfully", {
      executionTime,
      hospitalDatabase,
      userId,
      apiName: req.originalUrl,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: permissions.map(userPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error fetching user permissions", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching user permissions: " + error.message },
    });
  }
};


exports.updateUserPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
    const { error } = userPermission.validate(req.body);
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
    const userpermissionData = userPermissionPOST(RequestBody);

    const updated = await updateUserPermissionByIdDAO(
      req.sequelize,
      id,
      userpermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "User Permission updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid User Permission id, not found in DB",
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
        message: "Invalid User Permission id, not found in DB",
      });
    }

    res.status(200).json({
      message: "User Updated Permission Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: userPermissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Updating User Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Updating User Permission: " + error.message },
    });
  }
};

exports.toggleUserPermissionStatus = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { id } = req.params;
    const { is_active } = req.body; // true / false

    // ✅ Basic validation
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        errorCode: 4001,
        message: "is_active must be boolean (true/false)",
      });
    }

    // ✅ Toggle using DAO
    const updatedPermission =
      await toggleUserPermissionStatusDAO(
        req.sequelize,
        id,
        is_active
      );

    if (!updatedPermission) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid User Permission id, not found in DB",
        {
          errorCode,
          executionTime,
          hospitalDatabase,
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
        message: "Invalid User Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "User Permission status toggled successfully",
      {
        hospitalDatabase,
        executionTime,
        apiName: req.originalUrl,
      }
    );

    return res.status(200).json({
      message: "User Permission status updated successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: userPermissionGET(updatedPermission),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Toggling User Permission Status", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error Updating User Permission Status: " + error.message,
      },
    });
  }
};

exports.deleteUserPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;

  try {
    const deleted = await deleteUserPermissionByIdDAO(req.sequelize, id);

    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid UserPermission ID, not found in Database",
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
        message: "Invalid UserPermission ID, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "UserPermission Deleted Successfully", {
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
      message: "User Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting UserPermission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting UserPermission: " + error.message },
    });
  }
};

exports.getUserPermissionByQueryParams = async (req, res) => {
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
    const fieldMap = userPermissionMap;

    const ID_DTO_FIELD = "userPermissionId"; // Matches DTO
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
    const attributes = [...new Set(requestedDtoFields.map((field) => fieldMap[field]))];

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
      await getUserPermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched UserPermission successfully", {
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
      const fullDto = userPermissionGET(record);
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

    logger.logWithMeta("error", "Error Fetching UserPermission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching UserPermission: " + error.message },
    });
  }
};
