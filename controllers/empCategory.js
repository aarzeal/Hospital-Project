const EmpCategory = require('../models/tblEmpCategory');
const logger = require('../logger');



exports.createEmpCategory= async (req, res) => {
    const {EmployeeCategoryName, EmployeeCategoryCode, IsAnnualAllowanceApplicable, IsNoticePeriodApplicable, NoticePeriodType, NoticePeriodValue, IsProbationPeriodApplicable, ProbationPeriodType, ProbationPeriodValue, IsRoundingApplicable, RoundingType, IsNonActive, NonCompulsoryLeave, SalaryHeadLedgerIDR, SalaryPayableLedgerIDR } = req.body;
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
        HospitalGroupIDR
      });
      logger.info(`Created new EmpCategory successfully in ${Date.now() - startTime}ms`);
      res.status(201).json({
        meta: { statusCode: 201 },
        data: newEmpCategory
      });
    } catch (error) {
      logger.error(`Error creating EmpCategory: ${error.message} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 987 },
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
        logger.warn(`Employee Category with ID ${id} not found`);
        return res.status(404).json({
          meta: { statusCode: 404, errorCode: 1015 },
          error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
        });
      }
  
      logger.info(`Fetched Employee Category with ID ${id} successfully`);
      res.json({
        meta: { statusCode: 200 },
        data: empCategory
      });
    } catch (error) {
      logger.error(`Error fetching Employee Category with ID ${id}: ${error.message}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1016 },
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
      logger.error(`Error fetching Employee Categories: ${error.message}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1017 },
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
  
      logger.warn(`Employee Category with ID ${id} not found`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1020 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {
      logger.error(`Error updating Employee Category with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1021 },
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
  
      logger.warn(`Employee Category with ID ${id} not found`);
      res.status(404).json({
        meta: { statusCode: 404, errorCode: 1022 },
        error: { message: `Employee Category with ID ${id} not found. Please check the ID and try again.` }
      });
    } catch (error) {
      logger.error(`Error deleting Employee Category with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1023 },
        error: { message: 'Failed to delete Employee Category due to a server error. Please try again later.' }
      });
    }
  };
  