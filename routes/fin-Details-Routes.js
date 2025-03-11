const express = require('express');
const router = express.Router();
const fin_year= require('../controllers/fin-yr-Detials-controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/fin-year-details', validateJSONContentType,validateService.validateFinYearDetails,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.createFinYrDetails);
router.get('/fin-year-details', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getFinYrDetails);
router.get('/fin-year-details/:fin_year_Detail_id', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getFinYrDetailsById);
router.put('/fin-year-details/:fin_year_Detail_id',validateJSONContentType,validateService.validateFinYearDetailsupdate,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.updateFinYrDetails);
router.delete('/fin-year-details/:fin_year_Detail_id',authenticate,Userverifiction,ensureSequelizeInstance,fin_year.deleteFinYrDetails);


module.exports = router;
