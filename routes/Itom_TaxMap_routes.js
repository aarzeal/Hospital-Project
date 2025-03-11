const express = require('express');
const router = express.Router();
const MapController = require('../controllers/Itom_TaxMap_controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/TaxValidators');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/TaxMap-create',validateJSONContentType,validateService.validateTaxMap,authenticate,Userverifiction,ensureSequelizeInstance,MapController.createTaxMap);
router.get('/TaxMap-get',authenticate,Userverifiction,ensureSequelizeInstance,MapController.getAllTaxMaps);
router.get('/TaxMap-get/:taxMap_id',authenticate,Userverifiction,ensureSequelizeInstance,MapController.getTaxMapById);
router.put('/TaxMap-update/:taxMap_id',validateJSONContentType,validateService.validateTaxMapupdate,authenticate,Userverifiction,ensureSequelizeInstance,MapController.updateTaxMap);
router.delete('/TaxMap-delete/:taxMap_id',authenticate,Userverifiction,ensureSequelizeInstance,MapController.deleteTaxMap);







module.exports = router;
