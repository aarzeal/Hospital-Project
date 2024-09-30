const Designation = require('../models/designation');
const logger = require('../logger'); // Adjust path as needed


// GET all designations
exports.getAllDesignations = async (req, res) => {
  const start = Date.now();
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designations = await Designation.findAll();
      logger.info('Fetched all designations successfully');
      res.json({
        meta: { statusCode: 200 },
        data: designations
      });
    } catch (error) {


      // logger.error(`Error fetching designations: ${error.message},errorCode: ${errorCode}`);

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 992;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error fetching designations ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 992 },
        error: { message: 'Failed to fetch designations due to a server error. Please try again later.' }
      });
    }
  };
  
  // GET single designation by ID
  exports.getDesignationById = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designation = await Designation.findByPk(id);
      if (!designation) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 993;
        
        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `'Designation with ID ${id} not found`, {
          errorCode,
          // errorMessage: error.message, // Include the error message in meta explicitly
          executionTime,
          hospitalId: req.hospitalId,
        });
          // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 993 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      logger.info(`Fetched designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: designation
      });
    } catch (error) {
      const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 994;
        
        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `'Error fetching designation with ID ${id}: ${error.message}`, {
          errorCode,
          errorMessage: error.message, // Include the error message in meta explicitly
          executionTime,
          hospitalId: req.hospitalId,
        });
      // logger.error(`Error fetching designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 994 },
        error: { message: `Failed to fetch designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };
  
  exports.createDesignation = async (req, res) => {
    const start = Date.now();
    const { Designationname, DesignationCode, CreatedBy, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
    const HospitalIDR = req.hospitalId;
  
    try {
      const Designation = require('../models/designation')(req.sequelize);
      await Designation.sync();
      const newDesignation = await Designation.create({
        Designationname,
        DesignationCode,
        IsActive: true,
        CreatedBy,
        HospitalIDR, Reserve1, Reserve2, Reserve3, Reserve4
      });
      logger.info('Created new designation successfully');
      res.status(200).json({
        meta: { statusCode: 200 },
        data: newDesignation
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 995;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error fetching designation with ID ${id}: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error creating designation: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 995 },
        error: { message: 'Failed to create designation due to a server error. Please ensure all fields are correctly filled and try again.' }
      });
    }
  };
  
  
  
  // PUT update an existing designation
  exports.updateDesignation = async (req, res) => {
    const start = Date.now();
  const { id } = req.params;
    const { Designationname, DesignationCode, EditedBy, IsActive } = req.body;
  
    try {
      const Designation = require('../models/designation')(req.sequelize);
      let designation = await Designation.findByPk(id);
      if (!designation) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 996;
        
        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `'Designation with ID ${id} not found: ${error.message}`, {
          errorCode,
          errorMessage: error.message, // Include the error message in meta explicitly
          executionTime,
          hospitalId: req.hospitalId,
        });
        // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 996 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      designation = await designation.update({
        Designationname,
        DesignationCode,
        IsActive,
        EditedBy
      });
      logger.info(`Updated designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: designation
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 997;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error updating designation with ID ${id}: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error updating designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 997 },
        error: { message: `Failed to update designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };
  
  // DELETE delete a designation
  exports.deleteDesignation = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
  
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designation = await Designation.findByPk(id);
      if (!designation) {
        
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 998;
        
        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `'Designation with ID ${id} not found: ${error.message}`, {
          errorCode,
          errorMessage: error.message, // Include the error message in meta explicitly
          executionTime,
          hospitalId: req.hospitalId,
        });
        // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 998 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      await designation.destroy();
      logger.info(`Deleted designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        message: 'Designation deleted successfully'
      });

    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 999;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error deleting designation with ID ${id}:: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error deleting designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 999 },
        error: { message: `Failed to delete designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };

  // GET paginated designations
exports.getPaginatedDesignations = async (req, res) => {
  const start = Date.now();
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const offset = (page - 1) * limit;

  try {
    const Designation = require('../models/designation')(req.sequelize);
    const { count, rows } = await Designation.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    logger.info(`Fetched page ${page} of designations successfully`);
    res.json({
      meta: {
        statusCode: 200,
        currentPage: parseInt(page),
        totalPages,
        totalItems: count
      },
      data: rows
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1000;
    
    // Ensure that error.message is logged separately if needed
    logger.logWithMeta("warn", `'Error fetching paginated designations: ${error.message}`, {
      errorCode,
      errorMessage: error.message, // Include the error message in meta explicitly
      executionTime,
      hospitalId: req.hospitalId,
    });
    // logger.error(`Error fetching paginated designations: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1000 },
      error: { message: 'Failed to fetch paginated designations due to a server error. Please try again later.' }
    });
  }
};

