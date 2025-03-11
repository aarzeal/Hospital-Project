const express = require('express');
const router = express.Router();
const fin_year= require('../controllers/Fin-Group');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');

const Userverifiction = require('../validators/Accesstokenverify');

router.post('/fin-group', validateJSONContentType,validateService.finGroupValidationRules,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.createGroup);
router.get('/fin-group', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getGroup);
router.get('/fin-group/:fin_group_id', authenticate,Userverifiction,ensureSequelizeInstance,fin_year.getGroup);
router.put('/fin-group/:fin_group_id',validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,fin_year.updateGroup);
router.delete('/fin-group/:fin_group_id',authenticate,Userverifiction,ensureSequelizeInstance,fin_year.deleteGroup);


module.exports = router;
