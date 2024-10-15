const Designation = require('../models/designation');
const logger = require('../logger'); // Adjust path as needed
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 997 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}


// GET all designations
exports.getAllDesignations = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designations = await Designation.findAll();
       
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Fetched all designations successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers['user-agent'],
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
      logger.info('Fetched all designations successfully');
      res.json({
        meta: { statusCode: 200 },
        data: designations
      });
    } catch (error) {


      // logger.error(`Error fetching designations: ${error.message},errorCode: ${errorCode}`);

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 998;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching designations:`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 998 },
        error: { message: 'Failed to fetch designations due to a server error. Please try again later.' }
      });
    }
  };
  
  // GET single designation by ID
  exports.getDesignationById = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
    const clientIp = await getClientIp(req);
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designation = await Designation.findByPk(id);
      if (!designation) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 999;
    
        // Log the warning
        logger.logWithMeta("warn", `Designation with ID ${id} not found,errorCode:`, {
          errorCode,
    
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method         // HTTP method
        });
          // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 999 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
      logger.logWithMeta("info", `Fetched designation with ID ${id} successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers['user-agent'],
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      logger.info(`Fetched designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: designation
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1000;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching designation with ID ${id}:`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.error(`Error fetching designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1000 },
        error: { message: `Failed to fetch designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };
  
  exports.createDesignation = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
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
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
      logger.logWithMeta("info", `Created new designation successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers['user-agent'],
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.info('Created new designation successfully');
      res.status(200).json({
        meta: { statusCode: 200 },
        data: newDesignation
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1001;
  
      // Log the warning
      logger.logWithMeta("warn", `Error creating designation:`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.error(`Error creating designation: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1001 },
        error: { message: 'Failed to create designation due to a server error. Please ensure all fields are correctly filled and try again.' }
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
      const Designation = require('../models/designation')(req.sequelize);
      let designation = await Designation.findByPk(id);
      if (!designation) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1002;
    
        // Log the warning
        logger.logWithMeta("warn", `Designation with ID ${id} not found,errorCode:`, {
          errorCode,
    
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method         // HTTP method
        });
        // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 1002 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      designation = await designation.update({
        Designationname,
        DesignationCode,
        IsActive,
        EditedBy
      });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
      logger.logWithMeta("info", `Updated designation with ID ${id} successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers['user-agent'],
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.info(`Updated designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: designation
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1003;
  
      // Log the warning
      logger.logWithMeta("warn", `Error updating designation with ID ${id}:`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.error(`Error updating designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1003 },
        error: { message: `Failed to update designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };
  
  // DELETE delete a designation
  exports.deleteDesignation = async (req, res) => {
    const start = Date.now();
    const clientIp = await getClientIp(req);
    const { id } = req.params;
  
    try {
      const Designation = require('../models/designation')(req.sequelize);
      const designation = await Designation.findByPk(id);
      if (!designation) {
        
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1004;
    
        // Log the warning
        logger.logWithMeta("warn", `Designation with ID ${id} not found,errorCode:`, {
          errorCode,
    
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method         // HTTP method
        });
        // logger.warn(`Designation with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 1004 },
          error: { message: `Designation with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      await designation.destroy();
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
      logger.logWithMeta("info", `Deleted designation with ID ${id} successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
        userId: req.userId,
        ip: clientIp, // Correctly log the client IP
        userAgent: req.headers['user-agent'],
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.info(`Deleted designation with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        message: 'Designation deleted successfully'
      });

    } catch (error) {
      const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1005;
    
        // Log the warning
        logger.logWithMeta("warn", `Error deleting designation with ID ${id}:`, {
          errorCode,
    
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method         // HTTP method
        });
      // logger.error(`Error deleting designation with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1005 },
        error: { message: `Failed to delete designation with ID ${id} due to a server error. Please try again later.` }
      });
    }
  };

  // GET paginated designations
exports.getPaginatedDesignations = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const offset = (page - 1) * limit;

  try {
    const Designation = require('../models/designation')(req.sequelize);
    const { count, rows } = await Designation.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Fetched page ${page} of designations successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers['user-agent'],
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
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
    const errorCode = 1006;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching paginated designations:`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching paginated designations: ${error.message},errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1006 },
      error: { message: 'Failed to fetch paginated designations due to a server error. Please try again later.' }
    });
  }
};

