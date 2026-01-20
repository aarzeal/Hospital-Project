const { decodeAccessToken } = require("../util/decodeAccessToken");
const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const {  userFieldPermissionBulk, userFieldPermission } = require("../validators/joi-validator");
const { userFieldPermissionGET, userFieldPermissionPOST, userFieldPermissionMap } = require("../dtos/UserFieldsPermissionDTO");
const { getUserFieldPermissionByUniqueKeyDAO, bulkCreateUserFieldPermissionsDAO, createUserFieldPermissionDAO, getAllUserFieldPermissionsDAO, getUserFieldPermissionsByUserIdDAO, getUserFieldPermissionsBySubmoduleIdDAO, getIdByUserFieldPermissionDAO, getAllAccessByUserIdAndSubmoduleIdDAO, updateUserFieldPermissionByIdDAO, bulkUpdateUserFieldPermissionDAO, deleteUserFieldPermissionDAO, getUserFieldPermissionDataAsPerQueryParamDAO } = require("../Dao/UserFieldsPermissionDAO");

exports.createUserFieldPermissionsBulk = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // Wrap single object into array
    const requestBody = Array.isArray(req.body) ? req.body : [req.body];

    // ---------- STEP 1 : Validate Input ----------
    for (const item of requestBody) {
      const { error } = userFieldPermissionBulk.validate(item);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
    }

    const allRequestedPermissions = [];
    const validationErrors = [];

    for (const item of requestBody) {
      const { userId, submoduleId, fields } = item;

      if (!fields || fields.length === 0) continue;

      const firstHospitalIDR = fields[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({ userId, error: "HospitalIDR is required" });
        continue;
      }

      const hospital = await Hospital.findOne({
        where: { HospitalID: firstHospitalIDR },
      });

      if (!hospital) {
        validationErrors.push({ userId, error: "Invalid HospitalID" });
        continue;
      }

      const firstHospitalGroupIDR = fields[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: firstHospitalGroupIDR },
        });

        if (!group) {
          validationErrors.push({
            userId,
            error: "Invalid HospitalGroupID",
          });
          continue;
        }
      }

      fields.forEach((field) => {
        allRequestedPermissions.push({
          userId,
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
      const existing = await getUserFieldPermissionByUniqueKeyDAO(
        req.sequelize,
        perm.userId,
        perm.submoduleId,
        perm.fieldName,
        perm.hospitalIDR
      );

      if (existing) {
        existingSet.add(
          `${perm.userId}_${perm.submoduleId}_${perm.fieldName}_${perm.hospitalIDR}`
        );
      }
    }

    // ---------- STEP 3 : Prepare ONLY NEW records ----------
    const newPermissions = allRequestedPermissions
      .filter(
        (perm) =>
          !existingSet.has(
            `${perm.userId}_${perm.submoduleId}_${perm.fieldName}_${perm.hospitalIDR}`
          )
      )
      .map((perm) =>
        userFieldPermissionPOST({
          userId: perm.userId,
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

    // ---------- STEP 4 : If nothing new ----------
    if (newPermissions.length === 0) {
      return res.status(200).json({
        message: "No new user field permissions to add",
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
    const results = await bulkCreateUserFieldPermissionsDAO(
      req.sequelize,
      newPermissions
    );

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "User Field Permission created successfully", {
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          ip: clientIp,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: user?.userId,
        });

    const responseData = results.map((result) =>
      userFieldPermissionGET(result)
    );

    res.status(201).json({
      message: "User Field Permissions saved successfully",
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
      error: {
        message:
          "Error Creating User Field Permissions: " + error.message,
      },
    });
  }
};

exports.createUserFieldPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const user = decodeAccessToken(req);

  try {
    // ✅ Validation
    const { error } = userFieldPermission.validate(req.body);
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
        },
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

    const userFieldPermissionData = userFieldPermissionPOST(requestBody);

    // ✅ DB insert
    const result = await createUserFieldPermissionDAO(
      req.sequelize,
      userFieldPermissionData,
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "User Field Permission created successfully",
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
      },
    );

    // ✅ Response
    return res.status(201).json({
      message: "User Field Permission created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: userFieldPermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Creating User Field Permission", {
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
        message: "Error Creating User Field Permission: " + error.message,
      },
    });
  }
};


exports.getAllUserFieldPermissions = async (req, res) => {
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
    const result = await getAllUserFieldPermissionsDAO(
      req.sequelize,
      req.query?.hospitalIDR, // optional
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Fetched User Field Permissions successfully",
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
      },
    );

    // ✅ Response
    return res.status(200).json({
      message: "All User Field Permissions fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(userFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching User Field Permissions", {
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
        message: "Error Fetching User Field Permissions: " + error.message,
      },
    });
  }
};

exports.getUserFieldPermissionsByUserId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { userId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    const result = await getUserFieldPermissionsByUserIdDAO(
      req.sequelize,
      userId,
      hospitalIDR,
    );

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1481;

      logger.logWithMeta("error", "User Field Permissions not found", {
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
        message: "User Field Permissions not found",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Fetched User Field Permissions successfully",
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
      },
    );

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(userFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9481;

    logger.logWithMeta("error", "Error Fetching User Field Permissions", {
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
        message: "Error Fetching User Field Permissions: " + error.message,
      },
    });
  }
};

exports.getUserFieldPermissionsBySubModuleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { submoduleId } = req.params;
    const hospitalIDR = req.hospitalIDR;

    const result = await getUserFieldPermissionsBySubmoduleIdDAO(
      req.sequelize,
      submoduleId,
      hospitalIDR,
    );

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1481;

      logger.logWithMeta("error", "User Field Permissions not found", {
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
        message: "User Field Permissions not found",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Fetched User Field Permissions successfully",
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
      },
    );

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(userFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9481;

    logger.logWithMeta("error", "Error Fetching User Field Permissions", {
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
        message: "Error Fetching User Field Permissions: " + error.message,
      },
    });
  }
};


exports.getUserFieldPermissionsByFieldId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;

    const result = await getIdByUserFieldPermissionDAO(
      req.sequelize,
      id
    );

    // ---------- NOT FOUND ----------
    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "User Field Permission not found", {
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
        message: "User Field Permission not found in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    // ---------- SUCCESS LOG ----------
    logger.logWithMeta(
      "info",
      "Fetched User Field Permission successfully",
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
      },
    );

    // ---------- RESPONSE ----------
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: userFieldPermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9272;

    logger.logWithMeta("error", "Error Fetching User Field Permission", {
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
        message: "Error Fetching User Field Permission: " + error.message,
      },
    });
  }
};


exports.getAllUserFieldAccessByUserAndSubmodule = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { userId, submoduleId } = req.params;

    const result = await getAllAccessByUserIdAndSubmoduleIdDAO(
      req.sequelize,
      userId,
      submoduleId,
    );

    console.log("User Field Access Result:", result);

    if (!result || !result.fields || result.fields.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1264;

      logger.logWithMeta(
        "error",
        "No Field Access found for User & Submodule",
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
          updatedBy: req.username,
        },
      );

      return res.status(404).json({
        errorCode: 1265,
        message:
          "No field access found for this User & Submodule in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched User Field Access successfully", {
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

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;

    logger.logWithMeta("error", "Error Fetching User Field Access", {
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
        message: "Error Fetching User Field Access: " + error.message,
      },
    });
  }
};


exports.updateUserFieldPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // 🔹 Validation
    const { error } = userFieldPermission.validate(req.body);
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
        },
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

    const userFieldPermissionData = userFieldPermissionPOST(requestBody);

    // 🔹 Update DAO
    const updated = await updateUserFieldPermissionByIdDAO(
      req.sequelize,
      id,
      userFieldPermissionData,
    );

    const executionTime = `${Date.now() - start}ms`;

    if (!updated) {
      const errorCode = 9365;

      logger.logWithMeta(
        "error",
        "Invalid User Field Permission id, not found in DB",
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
        },
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid User Field Permission id, not found in DB",
      });
    }

    // 🔹 Success Log
    logger.logWithMeta("info", "User Field Permission updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      message: "User Field Permission Updated Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: userFieldPermissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9369;

    logger.logWithMeta("error", "Error Updating User Field Permission", {
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
        message: "Error Updating User Field Permission: " + error.message,
      },
    });
  }
};


exports.bulkUpdateUserFieldPermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    // 🔹 Validation (bulk schema – array of fields)
    const { error } = userFieldPermissionBulk.validate(req.body);
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
          updatedBy: user?.userId,
        }
      );

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
    const updated = await bulkUpdateUserFieldPermissionDAO(
      req.sequelize,
      req.body,
      user?.userId
    );

    const executionTime = `${Date.now() - start}ms`;

    if (!updated || updated.length === 0) {
      const errorCode = 9365;

      logger.logWithMeta(
        "error",
        "No User Field Permissions found to update",
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
        message: "No User Field Permissions found to update",
      });
    }

    // 🔹 Success Log
    logger.logWithMeta(
      "info",
      "User Field Permissions bulk updated successfully",
      {
        hospitalDatabase,
        executionTime,
        apiName: req.originalUrl,
      }
    );

    res.status(200).json({
      message: "User Field Permissions Updated In Bulk Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: updated.map(userFieldPermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9369;

    logger.logWithMeta(
      "error",
      "Error Bulk Updating User Field Permissions",
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
          "Error Bulk Updating User Field Permissions: " + error.message,
      },
    });
  }
};

exports.deleteUserFieldPermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;

  try {
    const deleted = await deleteUserFieldPermissionDAO(req.sequelize, id);

    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9345; 

      logger.logWithMeta(
        "error",
        "Invalid User Field Permission id, not found in Database",
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
        message: "Invalid User Field Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "User Field Permission deleted successfully",
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
      message: "User Field Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9349; 

    logger.logWithMeta(
      "error",
      "Error Deleting User Field Permission",
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
          "Error Deleting User Field Permission: " + error.message,
      },
    });
  }
};

exports.getUserFieldPermissionByQueryParams = async (req, res) => {
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
    const fieldMap = userFieldPermissionMap;

    const ID_DTO_FIELD = "userFieldPermissionId"; // DTO ID field

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
      await getUserFieldPermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched User Field Permission successfully", {
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
      const fullDto = userFieldPermissionGET(record);
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

    logger.logWithMeta("error", "Error Fetching User Field Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching User Field Permission: " + error.message,
      },
    });
  }
};
