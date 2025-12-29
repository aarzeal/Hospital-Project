const { decodeAccessToken } = require("../util/decodeAccessToken");
const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { rolepermission, rolepermissionBulk } = require("../validators/joi-validator");
const { rolePermissionPOST, rolePermissionGET, rolePermissionMap } = require("../dtos/RolePermissionDTO");
const { createRolePermissionDAO, getAllRolePermissionsDAO, getRolePermissionByIdDAO, updateRolePermissionByIdDAO, deleteRolePermissionByIdDAO, getRolePermissionDataAsPerQueryParamDAO, bulkCreateRolePermissionsDAO, deleteRolePermissionByRoleModuleDAO, getAllAccessByRoleIdDAO, getExistingRolePermissionsDAO, updateRolePermissionBySubmoduleDAO } = require("../Dao/RolePermissionDAO");
// const jwt = require("jsonwebtoken");

// exports.decodeAccessToken = (req) => {
//   try {
//     const authHeader = req.headers.accesstoken;

//     if (!authHeader) {
//       return null;
//     }

//     // Remove "Bearer " from token
//     const token = authHeader.startsWith("Bearer ")
//       ? authHeader.split(" ")[1]
//       : authHeader;

//     // Verify & decode
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     return decoded; // user details
//   } catch (error) {
//     console.error("JWT Decode Error:", error.message);
//     return null;
//   }
// };

exports.createRolePermissionsBulk = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  const user = decodeAccessToken(req);


  try {
    const { error } = rolepermissionBulk.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const allRequestedSubmodules = [];
    const validationErrors = [];

    // ---------- STEP 1 : Validate Input ----------
    for (const item of req.body) {
      const { roleId, moduleId, submodules } = item;

      if (!submodules || submodules.length === 0) continue;

      const firstHospitalIDR = submodules[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({
          roleId,
          moduleId,
          error: "HospitalIDR is required",
        });
        continue;
      }

      const hospital = await Hospital.findOne({
        where: { HospitalID: firstHospitalIDR },
      });

      if (!hospital) {
        validationErrors.push({
          roleId,
          moduleId,
          error: "Invalid HospitalID",
        });
        continue;
      }

      const firstHospitalGroupIDR = submodules[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: firstHospitalGroupIDR },
        });

        if (!group) {
          validationErrors.push({
            roleId,
            moduleId,
            error: "Invalid HospitalGroupID",
          });
          continue;
        }
      }

      // Collect submodules
      submodules.forEach((sub) => {
        allRequestedSubmodules.push({
          roleId,
          moduleId,
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

    // ---------- STEP 2 : Find Existing Records ----------
    const uniqueConditions = allRequestedSubmodules.map((item) => ({
      role_id: item.roleId,
      module_id: item.moduleId,
      submodule_id: item.submoduleId,
    }));

    const existingPermissions = await getExistingRolePermissionsDAO(
      req.sequelize,
      uniqueConditions
    );

    const existingSet = new Set(
      existingPermissions.map(
        (r) => `${r.role_id}_${r.module_id}_${r.submodule_id}`
      )
    );

    // ---------- STEP 3 : Prepare ONLY NEW records ----------
    const newRolePermissions = [];

    for (const sub of allRequestedSubmodules) {
      const key = `${sub.roleId}_${sub.moduleId}_${sub.submoduleId}`;

      if (!existingSet.has(key)) {
        newRolePermissions.push(
          rolePermissionPOST({
            roleId: sub.roleId,
            moduleId: sub.moduleId,
            submoduleId: sub.submoduleId,
            permissionId: sub.permissionId,
            isActive: sub.isActive,
            hospitalIDR: sub.hospitalIDR,
            hospitalGroupIDR: sub.hospitalGroupIDR,
            createdBy: user?.userId,
            // updatedBy: user?.userId,
            updatedBy: null,

          })
        );
      }
    }

    // ---------- STEP 4 : If nothing new, still SUCCESS ----------
    if (newRolePermissions.length === 0) {
      const executionTime = `${Date.now() - start}ms`;

      return res.status(200).json({
        message: "No new role permissions to add",
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

    // ---------- STEP 5 : Insert only NEW ----------
    const results = await bulkCreateRolePermissionsDAO(
      req.sequelize,
      newRolePermissions
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permissions added (new only)", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      count: results.length,
      createdBy: user?.userId,
    });

    const responseData = results.map((result) =>
      rolePermissionGET(result)
    );

    res.status(201).json({
      message: "Role Permissions saved successfully",
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

    logger.logWithMeta("error", "Error Creating Role Permissions in bulk", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Creating Role Permissions: " + error.message },
    });
  }
};


// Original single create function (unchanged)
exports.createRolePermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  const user = decodeAccessToken(req);


  try {
    const { error } = rolepermission.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

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
          createdBy: user?.userId,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const RequestBody = {
      ...req.body,
      createdBy: user?.userId,
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
      createdBy: user?.userId,
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

// CONTROLLER: GET ALL ACCESS BY ROLE ID
exports.getAllAccessByRoleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId } = req.params;
    const result = await getAllAccessByRoleIdDAO(req.sequelize, roleId);

    console.log("Role Access Result:", result);

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1264;

      logger.logWithMeta("error", "No Access found for Role", {
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
        errorCode: 1265,
        message: "No access found for this Role in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Access successfully", {
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
      // ✅ AB DIRECT grouped data jaayega (no map)
      data: result
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;

    logger.logWithMeta("error", "Error Fetching Role Access", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Access: " + error.message },
    });
  }
};



exports.updateRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  const user = decodeAccessToken(req);

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
        createdBy: req.user?.userId,
        // updatedBy: username,
        updatedBy: user?.userId,
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
          // createdBy: req.username,
          createdBy: req.user?.userId,
          // updatedBy: username,
          updatedBy: user?.userId,
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
      updatedBy: user?.userId,
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
          // createdBy: req.username,
          createdBy: req.user?.userId,
          // updatedBy: username,
          updatedBy: user?.userId,
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

// ✅ NEW API: Update Role Permission Status by Submodule
exports.updateRolePermissionBySubmodule = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  const user = decodeAccessToken(req);


  try {
    const { roleId } = req.params;
    const { moduleId, submoduleId, permissionId, isActive } = req.body;

    // Validation
    if (!moduleId || !submoduleId || !permissionId || isActive === undefined) {
      return res.status(400).json({
        meta: { statusCode: 400, hospitalDatabase },
        error: { message: "Missing required fields: moduleId, submoduleId, permissionId, isActive" }
      });
    }

    // Update in database
    const result = await updateRolePermissionBySubmoduleDAO(
      req.sequelize, 
      roleId, 
      moduleId, 
      submoduleId, 
      permissionId, 
      isActive,
      user?.userId // ✅ ADD THIS
    );

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      
      logger.logWithMeta("error", "Role permission not found for update", {
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        // createdBy: req.username,
        createdBy: user?.userId,
        // updatedBy: req.username,
        updatedBy: user?.userId,
        data: { roleId, moduleId, submoduleId, permissionId }
      });

      return res.status(404).json({
        meta: { statusCode: 404, executionTime, hospitalDatabase },
        error: { message: "Role permission record not found" }
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role permission status updated successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      // createdBy: req.username,
      createdBy: user?.userId,
      // updatedBy: req.username,
      updatedBy: user?.userId,
      data: { roleId, moduleId, submoduleId, permissionId, isActive }
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
        message: "Role permission status updated successfully"
      },
      data: result
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9251;

    logger.logWithMeta("error", "Error updating role permission status", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
      data: req.body
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating role permission status: " + error.message }
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
