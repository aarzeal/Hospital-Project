const express = require('express');
const router = express.Router();
const fin_year= require('../controllers/Financial_Year_Controlle');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');
const Userverifiction = require('../validators/Accesstokenverify');
router.post('/financial-year', validateService.validateFinYear,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.createFinYear);
router.get('/financial-year', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getAllFinYears);
router.get('/financial-year/:fin_year_code_id', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getFinYearById);
router.put('/financial-year/:fin_year_code_id', validateService.validateServicePriceList,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.updateFinYear);
router.delete('/financial-year/:fin_year_code_id',authenticate,Userverifiction,ensureSequelizeInstance,fin_year.deleteFinYear);


module.exports = router;
