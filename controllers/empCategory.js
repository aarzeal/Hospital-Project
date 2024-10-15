const EmpCategory = require('../models/tblEmpCategory');
const logger = require('../logger');

const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1047 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

exports.createEmpCategory= async (req, res) => {
    const {EmployeeCategoryName, EmployeeCategoryCode, IsAnnualAllowanceApplicable, IsNoticePeriodApplicable, NoticePeriodType, NoticePeriodValue, IsProbationPeriodApplicable, ProbationPeriodType, ProbationPeriodValue, IsRoundingApplicable, RoundingType, IsNonActive, NonCompulsoryLeave, SalaryHeadLedgerIDR, SalaryPayableLedgerIDR, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
    const HospitalGroupIDR = req.hospitalGroupIDR; 
    const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
    
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
  
      // Ensure the table exists
      await EmpCategory.sync();
  
      const newEmpCategory = await EmpCategory.create({
        EmployeeCategoryName,
        EmployeeCategoryCode,
        IsAnnualAllowanceApplicable,
        IsNoticePeriodApplicable,
        NoticePeriodType,
        NoticePeriodValue,
        IsProbationPeriodApplicable,
        ProbationPeriodType,
        ProbationPeriodValue,
        IsRoundingApplicable,
        RoundingType,
        IsNonActive,
        NonCompulsoryLeave,
        SalaryHeadLedgerIDR,
        SalaryPayableLedgerIDR,
        HospitalGroupIDR,
        Reserve1, Reserve2, Reserve3, Reserve4
      });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
     
  
      // Log the warning
      logger.logWithMeta("warn", `Created new EmpCategory successfully `, {
  
  
        executionTime,
        hospitalId: req.hospitalId,
        
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Created new EmpCategory successfully in ${Date.now() - startTime}ms`);
      res.status(201).json({
        meta: { statusCode: 200 },
        data: newEmpCategory
      });
    } catch (error) {
      const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1048;

    // Log the warning
    logger.logWithMeta("warn", `Error creating EmpCategory ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
      // logger.error(`Error creating EmpCategory: ${error.message}, errorCode: ${errorCode} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: errorCode },
        error: { message: 'Failed to create EmpCategory due to a server error. Please ensure all fields are correctly filled and try again.' }
      });
    }
  };
  

exports.getEmpCategoryById = async (req, res) => {
    const { id } = req.params;
    const start = Date.now();
    const clientIp = await getClientIp(req);
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
      const empCategory = await EmpCategory.findByPk(id);
  
      if (!empCategory) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1049;
    
        // Log the warning
        logger.logWithMeta("warn", `Employee Category with ID ${id} not found ${error.message}`, {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
    
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method    ,
          userAgent: req.headers['user-agent'],     // HTTP method
        });
        // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 1049 },
          error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
     
  
      // Log the warning
      logger.logWithMeta("warn", `Fetched Employee Category with ID ${id} successfully`, {
  
  
        executionTime,
        hospitalId: req.hospitalId,
        
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Fetched Employee Category with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: empCategory
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1050;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee Category with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Error fetching Employee Category with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1050 },
        error: { message: `Failed to fetch Employee Category with ID ${id} due to a server error. Please try again later.` }
      });
    } 
  };
  exports.getEmpCategoryByPagination = async (req, res) => {
    const { page, size } = req.query;
    const clientIp = await getClientIp(req);
    const start = Date.now();
  
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
      const empCategories = await EmpCategory.findAndCountAll({ limit, offset });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
     
  
      // Log the warning
      logger.logWithMeta("warn", `Fetched Employee Categories successfully`, {
  
  
        executionTime,
        hospitalId: req.hospitalId,
        
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      // logger.info(`Fetched Employee Categories successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: empCategories
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1051;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching Employee Categories: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Error fetching Employee Categories: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1051 },
        error: { message: `Failed to fetch Employee Categories due to a server error. Please try again later.` }
      });
    } 
  };
  
  exports.updateEmpCategory = async (req, res) => {
    const { id } = req.params;
    const { EmployeeCategoryName, EmployeeCategoryCode, IsAnnualAllowanceApplicable, IsNoticePeriodApplicable, NoticePeriodType, NoticePeriodValue, IsProbationPeriodApplicable, ProbationPeriodType, ProbationPeriodValue, IsRoundingApplicable, RoundingType, IsNonActive, NonCompulsoryLeave, SalaryHeadLedgerIDR, SalaryPayableLedgerIDR } = req.body;
    const start = Date.now();
    const clientIp = await getClientIp(req);
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
  
      const [updated] = await EmpCategory.update({
        EmployeeCategoryName,
        EmployeeCategoryCode,
        IsAnnualAllowanceApplicable,
        IsNoticePeriodApplicable,
        NoticePeriodType,
        NoticePeriodValue,
        IsProbationPeriodApplicable,
        ProbationPeriodType,
        ProbationPeriodValue,
        IsRoundingApplicable,
        RoundingType,
        IsNonActive,
        NonCompulsoryLeave,
        SalaryHeadLedgerIDR,
        SalaryPayableLedgerIDR
      }, {
        where: { EmployeeCategoryID: id }
      });
  
      if (updated) {
        const updatedEmpCategory = await EmpCategory.findByPk(id);
        const end = Date.now();
        const executionTime = `${end - start}ms`;
       
    
        // Log the warning
        logger.logWithMeta("warn", `Updated Employee Category with ID ${id} successfully`, {
    
    
          executionTime,
          hospitalId: req.hospitalId,
          
    
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method   ,  
          userAgent: req.headers['user-agent'],    // HTTP method
        });
        // logger.info(`Updated Employee Category with ID ${id} successfully in ${Date.now() - startTime}ms`);
        return res.status(200).json({
          meta: { statusCode: 200 },
          data: updatedEmpCategory
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1052;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee Category with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
  
      // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1052 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1053;
  
      // Log the warning
      logger.logWithMeta("warn", `Error updating Employee Category with ID ${id} ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Error updating Employee Category with ID ${id}: ${error.message} ,errorCode: ${errorCode} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1053 },
        error: { message: 'Failed to update Employee Category due to a server error. Please try again later.' }
      });
    }
  };
  
  exports.deleteEmpCategory = async (req, res) => {
    const { id } = req.params;
    const clientIp = await getClientIp(req);
    const start = Date.now();
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
  
      const deleted = await EmpCategory.destroy({
        where: { EmployeeCategoryID: id }
      });
  
      if (deleted) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
       
    
        // Log the warning
        logger.logWithMeta("warn", `Deleted Employee Category with ID ${id} successfully`, {
    
    
          executionTime,
          hospitalId: req.hospitalId,
          
    
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method   ,  
          userAgent: req.headers['user-agent'],    // HTTP method
        });
        // logger.info(`Deleted Employee Category with ID ${id} successfully in ${Date.now() - startTime}ms`);
        return res.status(200).json({
          meta: { statusCode: 200 },
          message: 'Employee Category deleted successfully.'
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1054;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee Category with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
  
      // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1054 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1055;
  
      // Log the warning
      logger.logWithMeta("warn", `Error deleting Employee Category with ID ${id}:${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Error deleting Employee Category with ID ${id}: ${error.message} ,errorCode: ${errorCode}in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1055 },
        error: { message: 'Failed to delete Employee Category due to a server error. Please try again later.' }
      });
    }
  };
  