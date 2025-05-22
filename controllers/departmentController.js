const logger = require("../logger"); // Assuming you have a logger module

const requestIp = require("request-ip");
const getLocationData = require("../util/locationHelper");
const { where } = require("sequelize");
// Helper function to log execution time
const logExecutionTime = (start, end, methodName) => {
  const duration = end - start;
  logger.info(`${methodName} executed in ${duration}ms`);
};

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
        erroerCode: 1024,
      });

      clientIp = "127.0.0.1"; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}
// GET all departments
exports.getAllDepartments = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const departments = await Department.findAll();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Fetched all departments successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      statusCode: 200,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // logger.info('Fetched all departments successfully');

    res.json({
      meta: { statusCode: 200 },
      data: departments,
      executionTime: `${end - start}ms`,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1025;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error fetching departments ${error.message}`, {
      errorCode,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1025,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Failed to fetch departments due to a server error. Please try again later.",
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "getAllDepartments");
  }
};

exports.getDepartmentsasperqueryparams = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const { DepartmentId, page, limit, ...queryColumns } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let attributes = Object.keys(queryColumns);
    if (!attributes.includes("DepartmentId")) {
      attributes.push("DepartmentId");
    }

    if (attributes.length === 1 && attributes[0] === "DepartmentId") {
      attributes = undefined;
    }
    let data, totalRecords;
    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter(
      (key) => key !== "page" && key !== "limit"
    );

    if (DepartmentId) {
      data = await Department.findOne({
        where: { DepartmentId },
        attributes,
      });
      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 2123;
        logger.logWithMeta("error", "Department not found", {
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
        return res
          .status(404)
          .json({ errorCode, message: "Department Not Found" });
      }
    } else{
      const isPagination=req.query.page && req.query.limit;
      if(filterKeys.length===0){
        if(isPagination){
          totalRecords=await Department.count();
          data= await Department.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['DepartmentId','ASC']],
          });
        }else{
          data=await Department.findAll({
            attributes,
            order:[['DepartmentId','ASC']],
          });
          totalRecords=data.length;
        }
      }else{
         if(isPagination){
          totalRecords=await Department.count();
          data= await Department.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['DepartmentId','ASC']],
          });
        }else{
          data=await Department.findAll({
            attributes,
            order:[['DepartmentId','ASC']],
          });
          totalRecords=data.length;
        }
      }
    }
const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Department Successfully",{
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
      const { DepartmentId, ...rest } = obj;
      return {DepartmentId, ...rest };
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

    if (!DepartmentId && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pageNum,
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
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Department data", {
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
      error: { message: "Error fetching Department: " + error.message },
    });
  }
};

// GET single department by ID
exports.getDepartmentById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const department = await Department.findByPk(id);

    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1026;
      const statusCode = 404;

      // Log the warning (No need to use error.message here as there's no error object)
      logger.logWithMeta("warn", `Department with ID ${id} not found`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1026, executionTime },
        error: {
          message: `Department with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }

    // Log the success
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    logger.logWithMeta(
      "info",
      `Fetched department with ID ${id} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );

    return res.json({
      meta: { statusCode: 200, executionTime },
      data: department,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1027;
    const statusCode = 500;

    // Log the error
    logger.logWithMeta(
      "error",
      `Error fetching department with ID ${id}: ${error.message}`,
      {
        errorCode,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );

    return res.status(500).json({
      meta: { statusCode: 500, errorCode: 1027, executionTime },
      error: {
        message: `Failed to fetch department with ID ${id} due to a server error. Please try again later.`,
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "getDepartmentById");
  }
};

// POST create a new department
exports.createDepartment = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const {
    DepartmentName,
    DeptCode,
    IsClinical,
    CreatedBy,
    Reserve1,
    Reserve2,
    Reserve3,
    Reserve4,
  } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    await Department.sync();
    const newDepartment = await Department.create({
      DepartmentName,
      DeptCode,
      statusCode: 200,
      IsClinical,
      IsActive: true,
      CreatedBy,
      HospitalIDR,
      Reserve1,
      Reserve2,
      Reserve3,
      Reserve4,
    });
    logger.info("Created new department successfully");
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta("warn", `Created new department successfully`, {
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200 },
      data: newDepartment,
      executionTime: `${end - start}ms`,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1028;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error creating department: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // logger.error(`Error creating department: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1028 },
      error: {
        message:
          "Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.",
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "createDepartment");
  }
};

// PUT update an existing department
exports.updateDepartment = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { DepartmentName, DeptCode, IsClinical, EditedBy, IsActive } = req.body;

  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    let department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1029;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Department with ID ${id} not found ${error.message}`,
        {
          errorCode,
          statusCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,

          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode}`);

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1029,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: `Department with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }
    department = await department.update({
      DepartmentName,
      DeptCode,
      IsClinical,
      IsActive,
      EditedBy,
    });
    // logger.info(`Updated department with ID ${id} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Updated department with ID ${id} successfully`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        statusCode: 200,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.json({
      meta: { statusCode: 200 },
      data: department,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1030;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error updating department with ID ${id}: ${error.message}`,
      {
        errorCode,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );

    // logger.error(`Error updating department with ID ${id}: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1030,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: `Failed to update department with ID ${id} due to a server error. Please try again later.`,
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "updateDepartment");
  }
};

// DELETE delete a department
exports.deleteDepartment = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);

  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1031;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Department with ID ${id} not found,errorCode:${error.message}`,
        {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          statusCode,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode},errorCode: ${errorCode}`);

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1031,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: `Department with ID ${id} not found. Please check the ID and try again.`,
        },
      });
    }
    await department.destroy();
    // logger.info(`Deleted department with ID ${id} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Deleted department with ID ${id} successfully`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        statusCode: 200,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.json({
      meta: { statusCode: 200 },
      message: "Department deleted successfully",
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1032;

    const statusCode = 500;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error deleting department with ID ${id}: ${error.message}`,
      {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.error(`Error deleting department with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1032,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: `Failed to delete department with ID ${id} due to a server error. Please try again later.`,
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "deleteDepartment");
  }
};

// GET departments by Hospital ID
exports.getDepartmentsByHospitalId = async (req, res) => {
  const start = Date.now();
  const { hospitalId } = req.params;
  const clientIp = await getClientIp(req);

  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const departments = await Department.findAll({
      where: { HospitalIDR: hospitalId },
    });
    // logger.info(`Fetched departments for Hospital ID ${hospitalId} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Fetched departments for Hospital ID ${hospitalId} successfully`,
      {
        statusCode: 200,

        executionTime,
        hospitalId: req.hospitalId,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: departments,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1033;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error fetching departments for Hospital ID ${hospitalId}: ${error.message}`,
      {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.error(`Error fetching departments for Hospital ID ${hospitalId}: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1033,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: `Failed to fetch departments for Hospital ID ${hospitalId} due to a server error. Please try again later.`,
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "getDepartmentsByHospitalId");
  }
};

// GET all departments with pagination
exports.getDepartmentsWithPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const Department = require("../models/DepartmentModel")(req.sequelize);
    const { count, rows } = await Department.findAndCountAll({
      offset,
      limit: parseInt(limit),
    });
    // logger.info('Fetched all departments successfully');
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta("warn", `Fetched all departments successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: {
        departments: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1034;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error fetching departments:
       ${error.message}`,
      {
        errorCode,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1034,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Failed to fetch departments due to a server error. Please try again later.",
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), "getDepartmentsWithPagination");
  }
};
