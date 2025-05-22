const Designation = require("../models/designation");
const logger = require("../logger"); // Adjust path as needed
const requestIp = require("request-ip");
const getLocationData = require("../util/locationHelper");

async function getClientIp(req) {
  let clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (
    clientIp === "::1" ||
    clientIp === "127.0.0.1" ||
    clientIp.startsWith("192.168") ||
    clientIp.startsWith("10.") ||
    clientIp.startsWith("172.")
  ) {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta("Error fetching public IP", {
        error: error.message,
        erroerCode: 997,
      });

      clientIp = "127.0.0.1"; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// GET all designations
exports.getAllDesignations = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const Designation = require("../models/designation")(req.sequelize);
    const designations = await Designation.findAll();

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Fetched all designations successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      statusCode: 200,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers["user-agent"],
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    logger.info("Fetched all designations successfully");
    res.json({
      meta: { statusCode: 200 },
      data: designations,
    });
  } catch (error) {
    // logger.error(`Error fetching designations: ${error.message},errorCode: ${errorCode}`);

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 998;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching designations:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 998 },
      error: {
        message:
          "Failed to fetch designations due to a server error. Please try again later.",
      },
    });
  }
};

exports.getdesignationasperqueryparam = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
      const Designation = require("../models/designation")(req.sequelize);
    console.log("designation:::",Designation)

    const { DesignationId, page, limit, ...queryColumns } = req.query;

    const pagenum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pagenum - 1) * limitNum;

    let attributes = Object.keys(queryColumns);

    if (!attributes.includes("DesignationId")) {
      attributes.push("DesignationId");
    }

    if (attributes.length === 1 && attributes[0] === "DesignationId") {
      attributes = undefined;
    }

    let data, totalRecords;

    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter(
      (key) => key !== "page" && key !== "limit"
    );

    if (DesignationId) {
      data = await Designation.findOne({
        where: { DesignationId },
        attributes,
      });

      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 3223;
        logger.logWithMeta("error", "Designation not Found", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          CreatedBy: req.username,
          updatedBy: req.username,
        });
        return res
          .status(404)
          .json({ errorCode, message: "Designation not found" });
      }
    } else {
      const isPagination = req.query.page && req.query.limit;

      if (filterKeys.length === 0) {
        if (isPagination) {
          totalRecords = await Designation.count();
          data = await Designation.findAll({
            offset,
            limit: limitNum,
            attributes,
            order: [["DesignationId", "ASC"]],
          });
        } else {
          data = await Designation.findAll({
            attributes,
            order: [["DesignationId", "ASC"]],
          });
          totalRecords = data.length;
        }
      } else {
        if (isPagination) {
          totalRecords = await Designation.count();
          data = await Designation.findAll({
            offset,
            limit: limitNum,
            attributes,
            order: [["DesignationId", "ASC"]],
          });
        } else {
          data = await Designation.findAll({
            attributes,
            order: [["DesignationId", "ASC"]],
          });
          totalRecords = data.length;
        }
      }
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Designation successfully", {
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

    const formatData = (record) => {
      const obj = record.toJSON();
      const { DesignationId, ...rest } = obj;
      return { DesignationId, ...rest };
    };
    const formattedData = Array.isArray(data)
      ? data.map(formatData)
      : data
      ? formatData(data)
      : null;

    const meta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (!DesignationId && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pagenum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }
    res.status(200).json({
      meta,
      data: formattedData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    errorCode = 3224;

    logger.logWithMeta("error", "Error fetching designation data", {
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
      error: { message: "Error Fetching Designation: " + error.message },
    });
  }
};

// GET single designation by ID
exports.getDesignationById = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);
  try {
    const Designation = require("../models/designation")(req.sequelize);
    const designation = await Designation.findByPk(id);
    if (!designation) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 999;
      const statusCode = 404;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Designation with ID ${id} not found,errorCode:`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method, // HTTP method
        }
      );
      // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 999 },
        error: {
          message: `Designation with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta(
      "info",
      `Fetched designation with ID ${id} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers["user-agent"],
        apiName: req.originalUrl, // API name
        method: req.method, // HTTP method
      }
    );
    logger.info(`Fetched designation with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: designation,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1000;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching designation with ID ${id}:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    // logger.error(`Error fetching designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1000 },
      error: {
        message: `Failed to fetch designation with ID ${id} due to a server error. Please try again later.`,
      },
    });
  }
};

exports.createDesignation = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const {
    Designationname,
    DesignationCode,
    CreatedBy,
    Reserve1,
    Reserve2,
    Reserve3,
    Reserve4,
  } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const Designation = require("../models/designation")(req.sequelize);
    await Designation.sync();
    const newDesignation = await Designation.create({
      Designationname,
      DesignationCode,
      IsActive: true,
      CreatedBy,
      HospitalIDR,
      Reserve1,
      Reserve2,
      Reserve3,
      Reserve4,
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Created new designation successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers["user-agent"],
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    // logger.info('Created new designation successfully');
    res.status(200).json({
      meta: { statusCode: 200 },
      data: newDesignation,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1001;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error creating designation:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    // logger.error(`Error creating designation: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1001 },
      error: {
        message:
          "Failed to create designation due to a server error. Please ensure all fields are correctly filled and try again.",
      },
    });
  }
};

// PUT update an existing designation
exports.updateDesignation = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { Designationname, DesignationCode, EditedBy, IsActive } = req.body;

  try {
    const Designation = require("../models/designation")(req.sequelize);
    let designation = await Designation.findByPk(id);
    if (!designation) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1002;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Designation with ID ${id} not found,errorCode:`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method, // HTTP method
        }
      );
      // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1002 },
        error: {
          message: `Designation with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }
    designation = await designation.update({
      Designationname,
      DesignationCode,
      IsActive,
      EditedBy,
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta(
      "info",
      `Updated designation with ID ${id} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers["user-agent"],
        apiName: req.originalUrl, // API name
        method: req.method, // HTTP method
      }
    );
    // logger.info(`Updated designation with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: designation,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1003;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error updating designation with ID ${id}:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    // logger.error(`Error updating designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1003 },
      error: {
        message: `Failed to update designation with ID ${id} due to a server error. Please try again later.`,
      },
    });
  }
};

// DELETE delete a designation
exports.deleteDesignation = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Designation = require("../models/designation")(req.sequelize);
    const designation = await Designation.findByPk(id);
    if (!designation) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1004;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Designation with ID ${id} not found,errorCode:`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method, // HTTP method
        }
      );
      // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1004 },
        error: {
          message: `Designation with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }
    await designation.destroy();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta(
      "info",
      `Deleted designation with ID ${id} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers["user-agent"],
        apiName: req.originalUrl, // API name
        method: req.method, // HTTP method
      }
    );
    // logger.info(`Deleted designation with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      message: "Designation deleted successfully",
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1005;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error deleting designation with ID ${id}:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method, // HTTP method
    });
    // logger.error(`Error deleting designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1005 },
      error: {
        message: `Failed to delete designation with ID ${id} due to a server error. Please try again later.`,
      },
    });
  }
};

// GET paginated designations
// exports.getPaginatedDesignations = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const { page = 1, limit = 10 } = req.query; // Default values if not provided
//   const offset = (page - 1) * limit;

//   try {
//     const Designation = require('../models/designation')(req.sequelize);
//     const { count, rows } = await Designation.findAndCountAll({
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     const totalPages = Math.ceil(count / limit);
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
//     logger.logWithMeta("info", `Fetched page ${page} of designations successfully`, {
//       executionTime,
//       statusCode:200,
//       hospitalId: req.hospitalId,
//       // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
//       userId: req.userId,
//       ip: clientIp, // Correctly log the client IP
//       userAgent: req.headers['user-agent'],
//       apiName: req.originalUrl, // API name
//       method: req.method         // HTTP method
//     });
//     logger.info(`Fetched page ${page} of designations successfully`);
//     res.json({
//       meta: {
//         statusCode: 200,
//         currentPage: parseInt(page),
//         totalPages,
//         totalItems: count
//       },
//       data: rows
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1006;
//     const statusCode = 500;

//     // Log the warning
//     logger.logWithMeta("warn", `Error fetching paginated designations:`, {
//       errorCode,
//       statusCode,
//       executionTime,
//       hospitalId: req.hospitalId,

//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method    ,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });
//     // logger.error(`Error fetching paginated designations: ${error.message},errorCode: ${errorCode}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 1006 },
//       error: { message: 'Failed to fetch paginated designations due to a server error. Please try again later.' }
//     });
//   }
// };
