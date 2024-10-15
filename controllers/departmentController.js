const logger = require('../logger'); // Assuming you have a logger module

const requestIp = require('request-ip');
// Helper function to log execution time
const logExecutionTime = (start, end, methodName) => {
  const duration = end - start;
  logger.info(`${methodName} executed in ${duration}ms`);
};

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1024 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}
// GET all departments
exports.getAllDepartments = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Fetched all departments successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
    });

    // logger.info('Fetched all departments successfully');

    res.json({
      meta: { statusCode: 200 },
      data: departments,
      executionTime: `${end - start}ms`
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1025;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching departments ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });




    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1025, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch departments due to a server error. Please try again later.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getAllDepartments');
  }
};

// GET single department by ID
exports.getDepartmentById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);

    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1026;

      // Log the warning (No need to use error.message here as there's no error object)
      logger.logWithMeta("warn", `Department with ID ${id} not found`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1026, executionTime },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }

    // Log the success
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    logger.logWithMeta("info", `Fetched department with ID ${id} successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      meta: { statusCode: 200, executionTime },
      data: department
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1027;

    // Log the error
    logger.logWithMeta("error", `Error fetching department with ID ${id}: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode: 1027, executionTime },
      error: { message: `Failed to fetch department with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getDepartmentById');
  }
};

// POST create a new department
exports.createDepartment = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { DepartmentName, DeptCode, IsClinical, CreatedBy, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    await Department.sync();
    const newDepartment = await Department.create({
      DepartmentName,
      DeptCode,
      IsClinical,
      IsActive: true,
      CreatedBy,
      HospitalIDR, Reserve1, Reserve2, Reserve3, Reserve4
    });
    logger.info('Created new department successfully');
    const end = Date.now();
    const executionTime = `${end - start}ms`;


    // Log the warning
    logger.logWithMeta("warn", `Created new department successfully`, {


      executionTime,
      hospitalId: req.hospitalId,


      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200 },
      data: newDepartment,
      executionTime: `${end - start}ms`
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1028;

    // Log the warning
    logger.logWithMeta("warn", `Error creating department: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    // logger.error(`Error creating department: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1028 },
      error: { message: 'Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'createDepartment');
  }
};

// PUT update an existing department
exports.updateDepartment = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { DepartmentName, DeptCode, IsClinical, EditedBy, IsActive } = req.body;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    let department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1029;

      // Log the warning
      logger.logWithMeta("warn", `Department with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode}`);

      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1029, executionTime: `${end - start}ms` },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    department = await department.update({
      DepartmentName,
      DeptCode,
      IsClinical,
      IsActive,
      EditedBy
    });
    // logger.info(`Updated department with ID ${id} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;


    // Log the warning
    logger.logWithMeta("warn", `Updated department with ID ${id} successfully`, {


      executionTime,
      hospitalId: req.hospitalId,


      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.json({
      meta: { statusCode: 200 },
      data: department
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1030;

    // Log the warning
    logger.logWithMeta("warn", `Error updating department with ID ${id}: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    // logger.error(`Error updating department with ID ${id}: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1030, executionTime: `${end - start}ms` },
      error: { message: `Failed to update department with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'updateDepartment');
  }
};

// DELETE delete a department
exports.deleteDepartment = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1031;

      // Log the warning
      logger.logWithMeta("warn", `Department with ID ${id} not found,errorCode:${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode},errorCode: ${errorCode}`);

      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1031, executionTime: `${end - start}ms` },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await department.destroy();
    // logger.info(`Deleted department with ID ${id} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;


    // Log the warning
    logger.logWithMeta("warn", `Deleted department with ID ${id} successfully`, {


      executionTime,
      hospitalId: req.hospitalId,


      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.json({
      meta: { statusCode: 200 },
      message: 'Department deleted successfully'
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1032;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting department with ID ${id}: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error deleting department with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    ;
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1032, executionTime: `${end - start}ms` },
      error: { message: `Failed to delete department with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'deleteDepartment');
  }
};

// GET departments by Hospital ID
exports.getDepartmentsByHospitalId = async (req, res) => {
  const start = Date.now();
  const { hospitalId } = req.params;
  const clientIp = await getClientIp(req);

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll({
      where: { HospitalIDR: hospitalId },
    });
    // logger.info(`Fetched departments for Hospital ID ${hospitalId} successfully`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;


    // Log the warning
    logger.logWithMeta("warn", `Fetched departments for Hospital ID ${hospitalId} successfully`, {


      executionTime,
      hospitalId: req.hospitalId,


      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: departments,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1033;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching departments for Hospital ID ${hospitalId}: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching departments for Hospital ID ${hospitalId}: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1033, executionTime: `${end - start}ms` },
      error: {
        message: `Failed to fetch departments for Hospital ID ${hospitalId} due to a server error. Please try again later.`,
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getDepartmentsByHospitalId');
  }
};

// GET all departments with pagination
exports.getDepartmentsWithPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
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


      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],    // HTTP method
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

    // Log the warning
    logger.logWithMeta("warn", `Error fetching departments:
       ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);

    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1034, executionTime: `${end - start}ms` },
      error: {
        message: 'Failed to fetch departments due to a server error. Please try again later.',
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getDepartmentsWithPagination');
  }
};
