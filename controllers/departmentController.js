const logger = require('../logger'); // Assuming you have a logger module

// GET all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll();
    logger.info('Fetched all departments successfully');
    res.json({
      meta: { statusCode: 200 },
      data: departments
    });
  } catch (error) {
    logger.error(`Error fetching departments: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1000 },
      error: { message: 'Failed to fetch departments due to a server error. Please try again later.' }
    });
  }
};

// GET single department by ID
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Department with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1001 },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched department with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: department
    });
  } catch (error) {
    logger.error(`Error fetching department with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1002 },
      error: { message: `Failed to fetch department with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// POST create a new department
exports.createDepartment = async (req, res) => {
  const { DepartmentName, DeptCode, IsClinical, CreatedBy } = req.body;
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
      HospitalIDR
    });
    logger.info('Created new department successfully');
    res.status(201).json({
      meta: { statusCode: 201 },
      data: newDepartment
    });
  } catch (error) {
    logger.error(`Error creating department: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1003 },
      error: { message: 'Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// PUT update an existing department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { DepartmentName, DeptCode, IsClinical, EditedBy, IsActive } = req.body;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    let department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Department with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1004 },
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
    res.json({
      meta: { statusCode: 200 },
      data: department
    });
  } catch (error) {
    logger.error(`Error updating department with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1005 },
      error: { message: `Failed to update department with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// DELETE delete a department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Department with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1006 },
        error: { message: `Department with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await department.destroy();
    logger.info(`Deleted department with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      message: 'Department deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting department with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1007 },
      error: { message: `Failed to delete department with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

exports.getDepartmentsByHospitalId = async (req, res) => {
  const { hospitalId } = req.params;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const departments = await Department.findAll({
      where: { HospitalIDR: hospitalId },
    });
    logger.info(`Fetched departments for Hospital ID ${hospitalId} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: departments,
    });
  } catch (error) {
    logger.error(`Error fetching departments for Hospital ID ${hospitalId}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1008 },
      error: {
        message:
          `Failed to fetch departments for Hospital ID ${hospitalId} due to a server error. Please try again later.`,
      },
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const Department = require('../models/DepartmentModel')(req.sequelize);
    const { count, rows } = await Department.findAndCountAll({
      offset,
      limit: parseInt(limit),
    });
    logger.info('Fetched all departments successfully');
    res.json({
      meta: { statusCode: 200 },
      data: {
        departments: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    logger.error(`Error fetching departments: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1000 },
      error: {
        message:
          'Failed to fetch departments due to a server error. Please try again later.',
      },
    });
  }
};