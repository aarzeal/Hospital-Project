const { decodeAccessToken } = require("../util/decodeAccessToken");
const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { Op } = require("sequelize");
const { submoduleFieldsBulkSchema, submoduleFieldsSchema } = require("../validators/joi-validator");
const { submoduleFieldsPOST, submoduleFieldsGET, submoduleFieldsMap } = require("../dtos/SubmoduleFieldsDTO");
const { bulkCreateSubmoduleFieldsDAO, createSubmoduleFieldDAO, getAllSubmoduleFieldsDAO, getSubmoduleFieldsBySubmoduleIdDAO, updateSubmoduleFieldByIdDAO, deleteSubmoduleFieldDAO, getSubmoduleFieldDataAsPerQueryParamDAO, getByFieldId, bulkUpdateSubmoduleFieldsBySubmoduleIdDAO } = require("../Dao/SubmoduleFieldsDAO");



exports.bulkCreateSubmoduleFields = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const user = decodeAccessToken(req);

  try {
    // ---------- STEP 0 : Validate Request Body ----------
    const { error } = submoduleFieldsBulkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const allRequestedFields = [];
    const validationErrors = [];

    // ---------- STEP 1 : Validate Input ----------
    for (const item of req.body) {
      const { submoduleId, fields } = item;

      if (!fields || fields.length === 0) continue;

      const firstHospitalIDR = fields[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({
          submoduleId,
          error: "HospitalIDR is required",
        });
        continue;
      }

      const hospital = await Hospital.findOne({
        where: { HospitalID: firstHospitalIDR },
      });

      if (!hospital) {
        validationErrors.push({
          submoduleId,
          error: "Invalid HospitalID",
        });
        continue;
      }

      const firstHospitalGroupIDR = fields[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: firstHospitalGroupIDR },
        });

        if (!group) {
          validationErrors.push({
            submoduleId,
            error: "Invalid HospitalGroupID",
          });
          continue;
        }
      }

      // Collect fields
      fields.forEach((field) => {
        allRequestedFields.push({
          fieldName: field.fieldName,
          submoduleId,
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
    const SubmoduleFields = require("../models/submoduleFieldsModel")(req.sequelize);

    const existingFields = await SubmoduleFields.findAll({
      where: {
        [Op.or]: allRequestedFields.map((f) => ({
          submodule_id: f.submoduleId,
          field_name: f.fieldName,
        })),
      },
    });

    const existingSet = new Set(
      existingFields.map(
        (r) => `${r.submodule_id}_${r.field_name}`
      )
    );

    // ---------- STEP 3 : Prepare ONLY NEW records ----------
    const newSubmoduleFields = [];

    for (const field of allRequestedFields) {
      const key = `${field.submoduleId}_${field.fieldName}`;

      if (!existingSet.has(key)) {
        newSubmoduleFields.push(
          submoduleFieldsPOST({
            fieldName: field.fieldName,
            submoduleId: field.submoduleId,
            isActive: field.isActive,
            hospitalIDR: field.hospitalIDR,
            hospitalGroupIDR: field.hospitalGroupIDR,
            createdBy: user?.userId,
            updatedBy: null,
          })
        );
      }
    }

    // ---------- STEP 4 : If nothing new ----------
    if (newSubmoduleFields.length === 0) {
      const executionTime = `${Date.now() - start}ms`;

      return res.status(200).json({
        message: "No new submodule fields to add",
        meta: {
          statusCode: 200,
          executionTime,
          hospitalDatabase,
          totalReceived: allRequestedFields.length,
          totalInserted: 0,
        },
        data: [],
      });
    }

    // ---------- STEP 5 : Insert only NEW ----------
    const results = await bulkCreateSubmoduleFieldsDAO(
      req.sequelize,
      newSubmoduleFields
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Submodule Fields added (bulk)", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      count: results.length,
      createdBy: user?.userId,
    });

    const responseData = results.map((r) =>
      submoduleFieldsGET(r)
    );

    res.status(201).json({
      message: "Submodule Fields saved successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
        totalReceived: allRequestedFields.length,
        totalInserted: results.length,
      },
      data: responseData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9262;

    logger.logWithMeta("error", "Error Creating Submodule Fields (bulk)", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Creating Submodule Fields: " + error.message,
      },
    });
  }
};



// Original single create function (unchanged)
exports.createSubmoduleField = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  const user = decodeAccessToken(req);

  try {
    // ---------- STEP 0 : Validate Request ----------
    const { error } = submoduleFieldsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // ---------- STEP 1 : Validate Hospital ----------
    const hospital = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });

    if (!hospital) {
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

    // ---------- STEP 2 : Validate Hospital Group (if provided) ----------
    if (req.body.hospitalGroupIDR) {
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
    }

    // ---------- STEP 3 : Prepare DTO ----------
    const requestBody = {
      ...req.body,
      createdBy: user?.userId,
      updatedBy: null,
    };

    const submoduleFieldData = submoduleFieldsPOST(requestBody);

    // ---------- STEP 4 : Create Record ----------
    const result = await createSubmoduleFieldDAO(
      req.sequelize,
      submoduleFieldData
    );

    const executionTime = `${Date.now() - start}ms`;

    // ---------- STEP 5 : Logging ----------
    logger.logWithMeta("info", "Submodule Field created successfully", {
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

    // ---------- STEP 6 : Response ----------
    res.status(201).json({
      message: "Submodule Field created successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
      },
      data: submoduleFieldsGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9270;

    logger.logWithMeta("error", "Error Creating Submodule Field", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Creating Submodule Field: " + error.message,
      },
    });
  }
};

const XLSX = require("xlsx");

exports.importSubmoduleFieldsFromExcel = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const user = decodeAccessToken(req);

  try {
    // ---------- STEP 0 : File Validation ----------
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    // ---------- STEP 1 : Read Excel ----------
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: null }
    );

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({
        message: "Excel file is empty",
      });
    }

    const allRequestedFields = [];
    const validationErrors = [];

    // ---------- STEP 2 : Validate Rows ----------
    for (const [index, row] of sheetData.entries()) {
      const {
        field_name,
        submodule_id,
        hospital_IDR,
        hospital_group_IDR,
        is_active,
      } = row;

      if (!field_name || !submodule_id || !hospital_IDR) {
        validationErrors.push({
          row: index + 2,
          error: "field_name, submodule_id and hospital_IDR are required",
        });
        continue;
      }

      const hospital = await Hospital.findOne({
        where: { HospitalID: hospital_IDR },
      });

      if (!hospital) {
        validationErrors.push({
          row: index + 2,
          error: "Invalid HospitalID",
        });
        continue;
      }

      if (hospital_group_IDR) {
        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: hospital_group_IDR },
        });

        if (!group) {
          validationErrors.push({
            row: index + 2,
            error: "Invalid HospitalGroupID",
          });
          continue;
        }
      }

      allRequestedFields.push({
        fieldName: field_name,
        submoduleId: submodule_id,
        isActive: is_active ?? true,
        hospitalIDR: hospital_IDR,
        hospitalGroupIDR: hospital_group_IDR,
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors found in Excel",
        errors: validationErrors,
      });
    }

    // ---------- STEP 3 : Check Existing Records ----------
    const SubmoduleFields = require("../models/submoduleFieldsModel")(req.sequelize);

    const existingFields = await SubmoduleFields.findAll({
      where: {
        [Op.or]: allRequestedFields.map((f) => ({
          submodule_id: f.submoduleId,
          field_name: f.fieldName,
        })),
      },
    });

    const existingSet = new Set(
      existingFields.map(
        (r) => `${r.submodule_id}_${r.field_name}`
      )
    );

    // ---------- STEP 4 : Prepare ONLY NEW ----------
    const newSubmoduleFields = [];

    for (const field of allRequestedFields) {
      const key = `${field.submoduleId}_${field.fieldName}`;

      if (!existingSet.has(key)) {
        newSubmoduleFields.push(
          submoduleFieldsPOST({
            fieldName: field.fieldName,
            submoduleId: field.submoduleId,
            isActive: field.isActive,
            hospitalIDR: field.hospitalIDR,
            hospitalGroupIDR: field.hospitalGroupIDR,
            createdBy: user?.userId,
            updatedBy: null,
          })
        );
      }
    }

    // ---------- STEP 5 : Nothing New ----------
    if (newSubmoduleFields.length === 0) {
      const executionTime = `${Date.now() - start}ms`;

      return res.status(200).json({
        message: "No new submodule fields to import",
        meta: {
          statusCode: 200,
          executionTime,
          hospitalDatabase,
          totalReceived: allRequestedFields.length,
          totalInserted: 0,
        },
        data: [],
      });
    }

    // ---------- STEP 6 : Bulk Insert ----------
    const results = await bulkCreateSubmoduleFieldsDAO(
      req.sequelize,
      newSubmoduleFields
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Submodule Fields imported from Excel", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      count: results.length,
      createdBy: user?.userId,
    });

    const responseData = results.map((r) =>
      submoduleFieldsGET(r)
    );

    res.status(201).json({
      message: "Submodule Fields imported successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
        totalReceived: allRequestedFields.length,
        totalInserted: results.length,
      },
      data: responseData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9271;

    logger.logWithMeta("error", "Error Importing Submodule Fields from Excel", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Importing Submodule Fields: " + error.message,
      },
    });
  }
};



exports.getAllSubmoduleFields = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    // ---------- STEP 0 : Validate DB Connection ----------
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

    // ---------- STEP 1 : Fetch Data ----------
    const result = await getAllSubmoduleFieldsDAO(
      req.sequelize,
      req.hospitalIDR
    );

    const executionTime = `${Date.now() - start}ms`;

    // ---------- STEP 2 : Logging ----------
    logger.logWithMeta("info", "Fetched Submodule Fields successfully", {
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

    // ---------- STEP 3 : Response ----------
    res.status(200).json({
      message: "All Submodule Fields fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(submoduleFieldsGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9271;

    logger.logWithMeta("error", "Error Fetching Submodule Fields", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Submodule Fields: " + error.message,
      },
    });
  }
};


exports.getSubmoduleFieldsBySubmoduleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
const { submoduleId } = req.params;

    const result = await getSubmoduleFieldsBySubmoduleIdDAO(
      req.sequelize,
       submoduleId
    );

    // ---------- NOT FOUND ----------
    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Submodule Field not found", {
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
        message: "Submodule Field not found in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    // ---------- SUCCESS LOG ----------
    logger.logWithMeta("info", "Fetched Submodule Field successfully", {
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
      // data: submoduleFieldsGET(result),
      data: result.map(submoduleFieldsGET),

    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9272;

    logger.logWithMeta("error", "Error Fetching Submodule Field", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Submodule Field: " + error.message,
      },
    });
  }
};

exports.getSubmodulesByFieldId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;

    const result = await getByFieldId(
      req.sequelize,
      id
    );

    // ---------- NOT FOUND ----------
    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Submodule Field not found", {
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
        message: "Submodule Field not found in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    // ---------- SUCCESS LOG ----------
    logger.logWithMeta("info", "Fetched Submodule Field successfully", {
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
      data: submoduleFieldsGET(result),

    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9272;

    logger.logWithMeta("error", "Error Fetching Submodule Field", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Submodule Field: " + error.message,
      },
    });
  }
};


// // CONTROLLER: GET ALL ACCESS BY ROLE ID
// exports.getAllAccessByRoleId = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);

//   try {
//     const { roleId } = req.params;
//     const result = await getAllAccessByRoleIdDAO(req.sequelize, roleId);

//     console.log("Role Access Result:", result);

//     if (!result || result.length === 0) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1264;

//       logger.logWithMeta("error", "No Access found for Role", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         createdBy: req.username,
//         updatedBy: req.username,
//       });

//       return res.status(404).json({
//         errorCode: 1265,
//         message: "No access found for this Role in Database",
//         hospitalDatabase,
//       });
//     }

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Fetched Role Access successfully", {
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

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//       },
//       // ✅ AB DIRECT grouped data jaayega (no map)
//       data: result
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9250;

//     logger.logWithMeta("error", "Error Fetching Role Access", {
//       errorCode,
//       executionTime,
//       hospitalDatabase,
//       apiName: req.originalUrl,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error Fetching Role Access: " + error.message },
//     });
//   }
// };




exports.updateSubmoduleFieldById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    const { id } = req.params;

    // 🔹 Validate Hospital
    const hospital = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });

    if (!hospital) {
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
          updatedBy: user?.userId,
        }
      );

      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    // 🔹 Prepare DTO input (IMPORTANT)
    const requestBody = {
      fieldName: req.body.fieldName,
      submoduleId: req.body.submoduleId,
      isActive: req.body.isActive,
      hospitalIDR: req.body.hospitalIDR,
      hospitalGroupIDR: req.body.hospitalGroupIDR,
      updatedBy: user?.userId,
    };

    const updatePayload = submoduleFieldsPOST(requestBody);

    // 🔹 Update DB
    const updated = await updateSubmoduleFieldByIdDAO(
      req.sequelize,
      id,
      updatePayload
    );

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Submodule Field id, not found in DB",
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
        message: "Invalid Submodule Field id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Submodule Field updated successfully",
      {
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
      }
    );

    res.status(200).json({
      message: "Submodule Field Updated Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: submoduleFieldsGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta(
      "error",
      "Error Updating Submodule Field",
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
        message: "Error Updating Submodule Field: " + error.message,
      },
    });
  }
};

exports.bulkUpdateSubmoduleFieldsBySubmoduleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const user = decodeAccessToken(req);

  try {
    const payload = req.body;

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of submodules",
      });
    }

    const result = [];

    for (const submodule of payload) {
      const { submoduleId, fields } = submodule;

      if (!submoduleId) {
        result.push({ submoduleId: null, message: "submoduleId is required" });
        continue;
      }

      if (!Array.isArray(fields) || fields.length === 0) {
        result.push({ submoduleId, message: "fields array is required" });
        continue;
      }

      let updatedCountForSubmodule = 0;

      for (const field of fields) {
        const {
          fieldId,
          fieldName,
          isActive,
          hospitalIDR,
          hospitalGroupIDR,
        } = field;

        if (!fieldId) {
          result.push({
            submoduleId,
            message: "fieldId is required for update",
          });
          continue;
        }

        if (!hospitalIDR || !hospitalGroupIDR) {
          result.push({
            submoduleId,
            fieldId,
            message: "hospitalIDR and hospitalGroupIDR are required",
          });
          continue;
        }

        const hospital = await Hospital.findOne({
          where: { HospitalID: hospitalIDR },
        });
        if (!hospital) {
          result.push({
            submoduleId,
            fieldId,
            message: `Invalid HospitalID ${hospitalIDR}`,
          });
          continue;
        }

        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: hospitalGroupIDR },
        });
        if (!group) {
          result.push({
            submoduleId,
            fieldId,
            message: `Invalid HospitalGroupID ${hospitalGroupIDR}`,
          });
          continue;
        }

        // ✅ DTO (fieldName added)
        const updatePayload = submoduleFieldsPOST({
          fieldName,
          isActive,
          updatedBy: user?.userId,
        });

        Object.keys(updatePayload).forEach(
          (key) => updatePayload[key] === undefined && delete updatePayload[key]
        );

        const [updatedCount] =
          await bulkUpdateSubmoduleFieldsBySubmoduleIdDAO(
            req.sequelize,
            fieldId,
            hospitalIDR,
            updatePayload
          );

        updatedCountForSubmodule += updatedCount;
      }

      result.push({
        submoduleId,
        updatedRecords: updatedCountForSubmodule,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Submodule Fields bulk updated successfully", {
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
    });

    res.status(200).json({
      message: "Submodule Fields Bulk Updated Successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      result,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("error", "Error Bulk Updating Submodule Fields", {
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        executionTime,
        hospitalDatabase,
      },
      error: {
        message: "Error Bulk Updating Submodule Fields: " + error.message,
      },
    });
  }
};






// // ✅ NEW API: Update Role Permission Status by Submodule
// exports.updateRolePermissionBySubmodule = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);
//   const user = decodeAccessToken(req);


//   try {
//     const { roleId } = req.params;
//     const { moduleId, submoduleId, permissionId, isActive } = req.body;

//     // Validation
//     if (!moduleId || !submoduleId || !permissionId || isActive === undefined) {
//       return res.status(400).json({
//         meta: { statusCode: 400, hospitalDatabase },
//         error: { message: "Missing required fields: moduleId, submoduleId, permissionId, isActive" }
//       });
//     }

//     // Update in database
//     const result = await updateRolePermissionBySubmoduleDAO(
//       req.sequelize, 
//       roleId, 
//       moduleId, 
//       submoduleId, 
//       permissionId, 
//       isActive,
//       user?.userId // ✅ ADD THIS
//     );

//     if (!result) {
//       const executionTime = `${Date.now() - start}ms`;
      
//       logger.logWithMeta("error", "Role permission not found for update", {
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         // createdBy: req.username,
//         createdBy: user?.userId,
//         // updatedBy: req.username,
//         updatedBy: user?.userId,
//         data: { roleId, moduleId, submoduleId, permissionId }
//       });

//       return res.status(404).json({
//         meta: { statusCode: 404, executionTime, hospitalDatabase },
//         error: { message: "Role permission record not found" }
//       });
//     }

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Role permission status updated successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       // createdBy: req.username,
//       createdBy: user?.userId,
//       // updatedBy: req.username,
//       updatedBy: user?.userId,
//       data: { roleId, moduleId, submoduleId, permissionId, isActive }
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//         message: "Role permission status updated successfully"
//       },
//       data: result
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9251;

//     logger.logWithMeta("error", "Error updating role permission status", {
//       errorCode,
//       executionTime,
//       hospitalDatabase,
//       apiName: req.originalUrl,
//       error: error.message,
//       data: req.body
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error updating role permission status: " + error.message }
//     });
//   }
// };


exports.deleteSubmoduleFieldById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;

  try {
    // ---------- DELETE ----------
    const deleted = await deleteSubmoduleFieldDAO(req.sequelize, id);

    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9345;

      logger.logWithMeta(
        "error",
        "Invalid Submodule Field id, not found in Database",
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
        message: "Invalid Submodule Field id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta(
      "info",
      "Submodule Field deleted successfully",
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

    return res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Submodule Field deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9349;

    logger.logWithMeta(
      "error",
      "Error Deleting Submodule Field",
      {
        errorCode,
        executionTime,
        hospitalDatabase,
        apiName: req.originalUrl,
        error: error.message,
      }
    );

    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Deleting Submodule Field: " + error.message,
      },
    });
  }
};


exports.getSubmoduleFieldsByQueryParams = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    // ---------- DB CHECK ----------
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

    // ---------- QUERY PARAMS ----------
    const { page, limit, ...queryFields } = req.query;
    const fieldMap = submoduleFieldsMap;

    const ID_DTO_FIELD = "fieldId";
    const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];

    // ---------- VALID DTO FIELDS ----------
    let requestedDtoFields = Object.keys(queryFields).filter(
      (field) => field in fieldMap
    );

    if (requestedDtoFields.length === 0) {
      requestedDtoFields = Object.keys(fieldMap);
    }

    // Always include ID
    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    // ---------- DB ATTRIBUTES ----------
    const attributes = [
      ...new Set(requestedDtoFields.map((field) => fieldMap[field])),
    ];

    if (Object.keys(queryFields).length && attributes.length === 0) {
      return res.status(400).json({
        message: "Invalid or unknown fields in query parameters",
        statusCode: 400,
      });
    }

    // ---------- PAGINATION ----------
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

    // ---------- DAO CALL ----------
    const { count: totalRecords, rows } =
      await getSubmoduleFieldDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Submodule Fields successfully", {
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

    // ---------- DTO FILTERING ----------
    const responseData = rows.map((record) => {
      const fullDto = submoduleFieldsGET(record);
      const filteredDto = {};

      for (const key of requestedDtoFields) {
        if (key in fullDto) {
          filteredDto[key] = fullDto[key];
        }
      }
      return filteredDto;
    });

    // ---------- META ----------
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

    return res.status(200).json({
      meta: responseMeta,
      data: responseData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Submodule Fields", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: {
        message: "Error Fetching Submodule Fields: " + error.message,
      },
    });
  }
};

