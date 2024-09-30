const logger = require('../logger'); // Assuming you have a logger module

// Helper function to log execution time
const logExecutionTime = (start, end, methodName) => {
  const duration = end - start;
  logger.info(`${methodName} executed in ${duration}ms`);
};

// GET all departments
exports.getAllDepartments = async (req, res) => {
  const start = Date.now();
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll();
    logger.info('Fetched all departments successfully');
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 },
      data: departments,
       executionTime: `${end - start}ms`
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1015;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error fetching departments ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);
   
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1015 , executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch departments due to a server error. Please try again later.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getAllDepartments');
  }
};

// GET single department by ID
exports.getDepartmentById = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1016;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Department with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });

      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode}`);
      
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1016, executionTime: `${end - start}ms`  },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched department with ID ${id} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms`  },
      data: department
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1017;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error fetching department with ID ${id}:  ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error fetching department with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1017, executionTime: `${end - start}ms`  },
      error: { message: `Failed to fetch department with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getDepartmentById');
  }
};

// POST create a new department
exports.createDepartment = async (req, res) => {
  const start = Date.now();
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
    res.status(200).json({
      meta: { statusCode: 200 },
      data: newDepartment,
       executionTime: `${end - start}ms` 
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1018;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error creating department: ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error creating department: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1018 },
      error: { message: 'Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'createDepartment');
  }
};

// PUT update an existing department
exports.updateDepartment = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const { DepartmentName, DeptCode, IsClinical, EditedBy, IsActive } = req.body;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    let department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1019;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Department with ID ${id} not found`, {
        errorCode,
        // errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode}`);
      
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1019, executionTime: `${end - start}ms`  },
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
    logger.info(`Updated department with ID ${id} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 },
      data: department
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1020;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error updating department with ID ${id}: ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error updating department with ID ${id}: ${error.message},errorCode: ${errorCode}`);
  
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1020 , executionTime: `${end - start}ms` },
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

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1021;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Department with ID ${id} not found,errorCode:`, {
        errorCode,
        // errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.warn(`Department with ID ${id} not found,errorCode: ${errorCode},errorCode: ${errorCode}`);
    
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1021 , executionTime: `${end - start}ms` },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await department.destroy();
    logger.info(`Deleted department with ID ${id} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 },
      message: 'Department deleted successfully'
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1022;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error deleting department with ID ${id}  :${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error deleting department with ID ${id}: ${error.message},errorCode: ${errorCode}`);
    ; 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1022, executionTime: `${end - start}ms`  },
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

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll({
      where: { HospitalIDR: hospitalId },
    });
    logger.info(`Fetched departments for Hospital ID ${hospitalId} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 , executionTime: `${end - start}ms` },
      data: departments,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1023;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error fetching departments for Hospital ID ${hospitalId} ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error fetching departments for Hospital ID ${hospitalId}: ${error.message},errorCode: ${errorCode}`);
    
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1023, executionTime: `${end - start}ms`  },
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
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const { count, rows } = await Department.findAndCountAll({
      offset,
      limit: parseInt(limit),
    });
    logger.info('Fetched all departments successfully');
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 , executionTime: `${end - start}ms` },
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
    const errorCode = 1024;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error fetching departments: ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error fetching departments: ${error.message},errorCode: ${errorCode}`);
  
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1024 , executionTime: `${end - start}ms` },
      error: {
        message: 'Failed to fetch departments due to a server error. Please try again later.',
      },
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getDepartmentsWithPagination');
  }
};
