const { decodeAccessToken } = require("../util/decodeAccessToken");
const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { roleFieldPermission, roleFieldPermissionBulk } = require("../validators/joi-validator");
const { roleFieldPermissionPOST, roleFieldPermissionGET, roleFieldPermissionMap } = require("../dtos/RoleFieldsPermissionDTO");
const { createRoleFieldPermissionDAO, getAllRoleFieldPermissionsDAO, updateRoleFieldPermissionByIdDAO, deleteRoleFieldPermissionDAO, getRoleFieldPermissionDataAsPerQueryParamDAO, bulkCreateRoleFieldPermissionsDAO, getRoleFieldPermissionByRoleAndFieldDAO, getRoleFieldPermissionsByRoleIdDAO, checkFieldAccessForRoleDAO, getRestrictedFieldsForRoleDAO, getIdByRoleFieldPermissionDAO, getRoleFieldPermissionsBySubmoduleIdDAO, bulkUpdateRoleFieldPermissionDAO } = require("../Dao/RoleFieldsPermissionDAO");


exports.createRoleFieldPermissionsBulk = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // Wrap single object into an array for uniform processing
    const requestBody = Array.isArray(req.body) ? req.body : [req.body];

    // ---------- STEP 1 : Validate Input ----------
    for (const item of requestBody) {
      const { error } = roleFieldPermissionBulk.validate(item);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
    }

    const allRequestedPermissions = [];
    const validationErrors = [];

    for (const item of requestBody) {
      const { roleId, submoduleId, fields } = item;

      if (!fields || fields.length === 0) continue;

      const firstHospitalIDR = fields[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({ roleId, error: "HospitalIDR is required" });
        continue;
      }

      const hospital = await Hospital.findOne({ where: { HospitalID: firstHospitalIDR } });
      if (!hospital) {
        validationErrors.push({ roleId, error: "Invalid HospitalID" });
        continue;
      }

      const firstHospitalGroupIDR = fields[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({ where: { HospitalGroupID: firstHospitalGroupIDR } });
        if (!group) {
          validationErrors.push({ roleId, error: "Invalid HospitalGroupID" });
          continue;
        }
      }

      fields.forEach((field) => {
        allRequestedPermissions.push({
          roleId,
          submoduleId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          permission: field.permission,
          isActive: field.isActive ?? true,
          hospitalIDR: field.hospitalIDR,
          hospitalGroupIDR: field.hospitalGroupIDR,
        });
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors found",
        errors: validationErrors,
      });
    }

    // ---------- STEP 2 : Find Existing Records ----------
    const existingSet = new Set();

    for (const perm of allRequestedPermissions) {
      const existing = await getRoleFieldPermissionByRoleAndFieldDAO(
        req.sequelize,
        perm.roleId,
        perm.fieldName,
        perm.hospitalIDR
      );

      if (existing) {
        existingSet.add(`${perm.roleId}_${perm.fieldName}_${perm.hospitalIDR}`);
      }
    }

    // ---------- STEP 3 : Prepare ONLY NEW records ----------
    const newPermissions = allRequestedPermissions
      .filter((perm) => !existingSet.has(`${perm.roleId}_${perm.fieldName}_${perm.hospitalIDR}`))
      .map((perm) =>
        roleFieldPermissionPOST({
          roleId: perm.roleId,
          submoduleId: perm.submoduleId,
          fieldName: perm.fieldName,
          fieldType: perm.fieldType,
          permission: perm.permission,
          isActive: perm.isActive,
          hospitalIDR: perm.hospitalIDR,
          hospitalGroupIDR: perm.hospitalGroupIDR,
          createdBy: user?.userId,
          updatedBy: null,
        })
      );

    // ---------- STEP 4 : If nothing new, still SUCCESS ----------
    if (newPermissions.length === 0) {
      return res.status(200).json({
        message: "No new role field permissions to add",
        meta: {
          statusCode: 200,
          executionTime: `${Date.now() - start}ms`,
          hospitalDatabase,
          totalReceived: allRequestedPermissions.length,
          totalInserted: 0,
        },
        data: [],
      });
    }

    // ---------- STEP 5 : Insert only NEW ----------
    const results = await bulkCreateRoleFieldPermissionsDAO(req.sequelize, newPermissions);

    const executionTime = `${Date.now() - start}ms`;

    const responseData = results.map((result) => roleFieldPermissionGET(result));

    res.status(201).json({
      message: "Role Field Permissions saved successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
        totalReceived: allRequestedPermissions.length,
        totalInserted: results.length,
      },
      data: responseData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    res.status(500).json({
      meta: { statusCode: 500, executionTime, hospitalDatabase },
      error: { message: "Error Creating Role Field Permissions: " + error.message },
    });
  }
};



exports.createRoleFieldPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const user = decodeAccessToken(req);

  try {
    // ✅ Validation
    const { error } = roleFieldPermission.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    // ✅ Hospital validation
    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });

    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta(
        "error",
        "Invalid HospitalID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    // ✅ Hospital Group validation
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
          createdBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    // ✅ Prepare payload
    const requestBody = {
      ...req.body,
      createdBy: user?.userId,
      updatedBy: user?.userId,
    };

    const roleFieldPermissionData =
      roleFieldPermissionPOST(requestBody);

    // ✅ DB insert
    const result = await createRoleFieldPermissionDAO(
      req.sequelize,
      roleFieldPermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Role Field Permission created successfully",
      {
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        ip: clientIp,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: user?.userId,
      }
    );

    // ✅ Response
    return res.status(201).json({
      message: "Role Field Permission created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: roleFieldPermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta(
      "error",
      "Error Creating Role Field Permission",
      {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      }
    );

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message:
          "Error Creating Role Field Permission: " + error.message,
      },
    });
  }
};



exports.getAllRoleFieldPermissions = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    // ✅ DB connection check
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

    // ✅ Fetch data
    const result = await getAllRoleFieldPermissionsDAO(
      req.sequelize,
      req.query?.hospitalIDR // optional
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Fetched Role Field Permissions successfully",
      {
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
      }
    );

    // ✅ Response
    return res.status(200).json({
      message: "All Role Field Permissions fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(roleFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role Field Permissions", {
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
        message:
          "Error Fetching Role Field Permissions: " + error.message,
      },
    });
  }
};


exports.getRoleFieldPermissionsByRoleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    const result = await getRoleFieldPermissionsByRoleIdDAO(
      req.sequelize,
      roleId,
      hospitalIDR
    );

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1481;

      logger.logWithMeta("error", "Role Field Permissions not found", {
        errorCode,
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

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
          hospitalDatabase,
        },
        message: "Role Field Permissions not found",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Field Permissions successfully", {
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

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(roleFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9481;

    logger.logWithMeta("error", "Error Fetching Role Field Permissions", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error Fetching Role Field Permissions: " + error.message,
      },
    });
  }
};

exports.getRoleFieldPermissionsBySubModuleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { submoduleId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    const result = await getRoleFieldPermissionsBySubmoduleIdDAO(
      req.sequelize,
      submoduleId,
      hospitalIDR
    );

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1481;

      logger.logWithMeta("error", "Role Field Permissions not found", {
        errorCode,
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

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
          hospitalDatabase,
        },
        message: "Role Field Permissions not found",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Field Permissions successfully", {
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

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(roleFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9481;

    logger.logWithMeta("error", "Error Fetching Role Field Permissions", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error Fetching Role Field Permissions: " + error.message,
      },
    });
  }
};

exports.getRoleFieldPermissionsByFieldId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;

    const result = await getIdByRoleFieldPermissionDAO(
      req.sequelize,
      id
    );

    // ---------- NOT FOUND ----------
    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Role Field Permission not found", {
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
        message: "Role Field Permission not found in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    // ---------- SUCCESS LOG ----------
    logger.logWithMeta("info", "Fetched Role Field Permission successfully", {
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

    // ---------- RESPONSE ----------
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: roleFieldPermissionGET(result),

    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9272;

    logger.logWithMeta("error", "Error Fetching Role Field Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Role Field Permission: " + error.message,
      },
    });
  }
};


exports.updateRoleFieldPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // 🔹 Validation (agar schema hai)
    const { error } = roleFieldPermission.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // 🔹 Validate Hospital
    const hospital = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });

    if (!hospital) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1360;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: user?.userId,
        updatedBy: user?.userId,
      });

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    // 🔹 Validate Hospital Group
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: req.body.hospitalGroupIDR },
    });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1361;

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
          createdBy: user?.userId,
          updatedBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const { id } = req.params;

    // 🔹 Prepare DTO payload
    const requestBody = {
      ...req.body,
      updatedBy: user?.userId,
    };

    const roleFieldPermissionData =
      roleFieldPermissionPOST(requestBody);

    // 🔹 Update DAO
    const updated =
      await updateRoleFieldPermissionByIdDAO(
        req.sequelize,
        id,
        roleFieldPermissionData
      );

    const executionTime = `${Date.now() - start}ms`;

    if (!updated) {
      const errorCode = 9365;

      logger.logWithMeta(
        "error",
        "Invalid Role Field Permission id, not found in DB",
        {
          errorCode,
          executionTime,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: user?.userId,
          updatedBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid Role Field Permission id, not found in DB",
      });
    }

    // 🔹 Success Log
    logger.logWithMeta(
      "info",
      "Role Field Permission updated successfully",
      {
        hospitalDatabase,
        executionTime,
        apiName: req.originalUrl,
      }
    );

    res.status(200).json({
      message: "Role Field Permission Updated Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: roleFieldPermissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9369;

    logger.logWithMeta(
      "error",
      "Error Updating Role Field Permission",
      {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      }
    );

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message:
          "Error Updating Role Field Permission: " + error.message,
      },
    });
  }
};

exports.bulkUpdateRoleFieldPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // 🔹 Validation (bulk schema hona chahiye – array fields)
    const { error } = roleFieldPermissionBulk.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fields } = req.body;

    // 🔹 Validate Hospital (first field se)
    const hospital = await Hospital.findOne({
      where: { HospitalID: fields[0].hospitalIDR },
    });

    if (!hospital) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1360;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: user?.userId,
        updatedBy: user?.userId,
      });

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    // 🔹 Validate Hospital Group
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: fields[0].hospitalGroupIDR },
    });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1361;

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
          createdBy: user?.userId,
          updatedBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    // 🔹 Bulk Update DAO call
    const updated =
      await bulkUpdateRoleFieldPermissionDAO(
        req.sequelize,
        req.body,
        user?.userId
      );

    const executionTime = `${Date.now() - start}ms`;

    if (!updated || updated.length === 0) {
      const errorCode = 9365;

      logger.logWithMeta(
        "error",
        "No Role Field Permissions found to update",
        {
          errorCode,
          executionTime,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: user?.userId,
          updatedBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "No Role Field Permissions found to update",
      });
    }

    // 🔹 Success Log
    logger.logWithMeta(
      "info",
      "Role Field Permissions bulk updated successfully",
      {
        hospitalDatabase,
        executionTime,
        apiName: req.originalUrl,
      }
    );

    res.status(200).json({
      message: "Role Field Permissions Updated In Bulk Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: updated.map(roleFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9369;

    logger.logWithMeta(
      "error",
      "Error Bulk Updating Role Field Permissions",
      {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      }
    );

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message:
          "Error Bulk Updating Role Field Permissions: " + error.message,
      },
    });
  }
};


exports.deleteRoleFieldPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;

  try {
    const deleted = await deleteRoleFieldPermissionDAO(
      req.sequelize,
      id
    );

    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9345;

      logger.logWithMeta(
        "error",
        "Invalid Role Field Permission id, not found in Database",
        {
          errorCode,
          executionTime,
          ID: id,
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
        message:
          "Invalid Role Field Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Role Field Permission deleted successfully",
      {
        executionTime,
        ID: id,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      }
    );

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      message: "Role Field Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9349;

    logger.logWithMeta(
      "error",
      "Error Deleting Role Field Permission",
      {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      }
    );

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message:
          "Error Deleting Role Field Permission: " +
          error.message,
      },
    });
  }
};

exports.getRoleFieldPermissionByQueryParams = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088; // same as RolePermission controller

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
    const fieldMap = roleFieldPermissionMap;

    const ID_DTO_FIELD = "roleFieldPermissionId"; // DTO ID field

    // Extract valid DTO fields from query params
    let requestedDtoFields = Object.keys(queryFields).filter(
      (field) => field in fieldMap
    );
    if (requestedDtoFields.length === 0) {
      requestedDtoFields = Object.keys(fieldMap);
    }

    // Always include ID field
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
      await getRoleFieldPermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Field Permission successfully", {
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
      const fullDto = roleFieldPermissionGET(record);
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
    const errorCode = 9249; // same as RolePermission controller

    logger.logWithMeta("error", "Error Fetching Role Field Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Role Field Permission: " + error.message,
      },
    });
  }
};


/**
 * CHECK FIELD ACCESS FOR ROLE (Blacklist Approach)
 * Returns true if user has access, false if no access
 */
exports.checkFieldAccessForRole = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId, fieldId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    if (!roleId || !fieldId) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1400;

      logger.logWithMeta("error", "Role ID and Field ID are required", {
        errorCode,
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

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode,
          executionTime,
          hospitalDatabase,
        },
        message: "Role ID and Field ID are required",
      });
    }

    // Import the DAO function

    const hasAccess = await checkFieldAccessForRoleDAO(
      req.sequelize,
      roleId,
      fieldId,
      hospitalIDR
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Field access checked successfully", {
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
      roleId,
      fieldId,
      hasAccess,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: {
        roleId,
        fieldId,
        hasAccess,
      },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9485;

    logger.logWithMeta("error", "Error checking field access", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error checking field access: " + error.message,
      },
    });
  }
};


/**
 * GET RESTRICTED FIELDS FOR A ROLE (Fields with "no_access" permission)
 */
exports.getRestrictedFieldsForRole = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    if (!roleId) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1400;

      logger.logWithMeta("error", "Role ID is required", {
        errorCode,
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

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode,
          executionTime,
          hospitalDatabase,
        },
        message: "Role ID is required",
      });
    }

    // Import the DAO function

    const restrictedFields = await getRestrictedFieldsForRoleDAO(
      req.sequelize,
      roleId,
      hospitalIDR
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Restricted fields fetched successfully", {
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
      roleId,
      count: restrictedFields.length,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: {
        roleId,
        restrictedFields: restrictedFields.map(roleFieldPermissionGET),
        count: restrictedFields.length,
      },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9486;

    logger.logWithMeta("error", "Error fetching restricted fields", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error fetching restricted fields: " + error.message,
      },
    });
  }
};