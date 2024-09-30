const EmpCategory = require('../models/tblEmpCategory');
const logger = require('../logger');



exports.createEmpCategory= async (req, res) => {
    const {EmployeeCategoryName, EmployeeCategoryCode, IsAnnualAllowanceApplicable, IsNoticePeriodApplicable, NoticePeriodType, NoticePeriodValue, IsProbationPeriodApplicable, ProbationPeriodType, ProbationPeriodValue, IsRoundingApplicable, RoundingType, IsNonActive, NonCompulsoryLeave, SalaryHeadLedgerIDR, SalaryPayableLedgerIDR, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
    const HospitalGroupIDR = req.hospitalGroupIDR; // Get the HospitalIDR from the decoded token
    const startTime = Date.now();
  
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
      logger.info(`Created new EmpCategory successfully in ${Date.now() - startTime}ms`);
      res.status(201).json({
        meta: { statusCode: 200 },
        data: newEmpCategory
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1035;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error updating module ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
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
    const startTime = Date.now();
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
      const empCategory = await EmpCategory.findByPk(id);
  
      if (!empCategory) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 1036;
        
        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `'Employee Category with ID ${id} not found. Please check the ID and try again `, {
          errorCode,
          // errorMessage: error.message, // Include the error message in meta explicitly
          executionTime,
          hospitalId: req.hospitalId,
        });
        // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 1036 },
          error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
        });
      }
  
      logger.info(`Fetched Employee Category with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: empCategory
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1037;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error fetching Employee Category with ID ${id}: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error fetching Employee Category with ID ${id}: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1037 },
        error: { message: `Failed to fetch Employee Category with ID ${id} due to a server error. Please try again later.` }
      });
    } 
  };
  exports.getEmpCategoryByPagination = async (req, res) => {
    const { page, size } = req.query;
    const startTime = Date.now();
  
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
      const empCategories = await EmpCategory.findAndCountAll({ limit, offset });
  
      logger.info(`Fetched Employee Categories successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: empCategories
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1038;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error fetching Employee Categories ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error fetching Employee Categories: ${error.message},errorCode: ${errorCode}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1038 },
        error: { message: `Failed to fetch Employee Categories due to a server error. Please try again later.` }
      });
    } 
  };
  
  exports.updateEmpCategory = async (req, res) => {
    const { id } = req.params;
    const { EmployeeCategoryName, EmployeeCategoryCode, IsAnnualAllowanceApplicable, IsNoticePeriodApplicable, NoticePeriodType, NoticePeriodValue, IsProbationPeriodApplicable, ProbationPeriodType, ProbationPeriodValue, IsRoundingApplicable, RoundingType, IsNonActive, NonCompulsoryLeave, SalaryHeadLedgerIDR, SalaryPayableLedgerIDR } = req.body;
    const startTime = Date.now();
  
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
        logger.info(`Updated Employee Category with ID ${id} successfully in ${Date.now() - startTime}ms`);
        return res.status(200).json({
          meta: { statusCode: 200 },
          data: updatedEmpCategory
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1039;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Employee Category with ID ${id} not found,errorCode`, {
        errorCode,
        // errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
  
      // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1039 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1040;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error updating Employee Category with ID ${id}: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error updating Employee Category with ID ${id}: ${error.message} ,errorCode: ${errorCode} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1040 },
        error: { message: 'Failed to update Employee Category due to a server error. Please try again later.' }
      });
    }
  };
  
  exports.deleteEmpCategory = async (req, res) => {
    const { id } = req.params;
    const startTime = Date.now();
  
    try {
      const EmpCategory = require('../models/tblEmpCategory')(req.sequelize);
  
      const deleted = await EmpCategory.destroy({
        where: { EmployeeCategoryID: id }
      });
  
      if (deleted) {
        logger.info(`Deleted Employee Category with ID ${id} successfully in ${Date.now() - startTime}ms`);
        return res.status(200).json({
          meta: { statusCode: 200 },
          message: 'Employee Category deleted successfully.'
        });
      }
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1041;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Employee Category with ID ${id} not found. Please check the ID and try again.`, {
        errorCode,
        // errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
  
      // logger.warn(`Employee Category with ID ${id} not found,errorCode: ${errorCode}`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1041 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1042;
      
      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `'Error deleting Employee Category with ID ${id}: ${error.message}`, {
        errorCode,
        errorMessage: error.message, // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.error(`Error deleting Employee Category with ID ${id}: ${error.message} ,errorCode: ${errorCode}in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1042 },
        error: { message: 'Failed to delete Employee Category due to a server error. Please try again later.' }
      });
    }
  };
  