const express = require('express');
const router = express.Router();
const serviceSOR = require('../controllers/ServiceSORController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validate  = require('../validators/Servicesvalidator');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/ServiceSor', validateJSONContentType,authenticate,validate.validateServiceSOR,Userverifiction,ensureSequelizeInstance,serviceSOR.createServiceSOR);
router.get('/ServiceSor', authenticate,Userverifiction,ensureSequelizeInstance,serviceSOR.getServiceSOR);
router.get('/ServiceSor/:serviceSOR_ID', authenticate,Userverifiction,ensureSequelizeInstance,serviceSOR.getServiceSORById);
router.put('/ServiceSor/:serviceSOR_ID', authenticate,Userverifiction,ensureSequelizeInstance,validate.validateServiceSORUpdate,serviceSOR.updateServiceSOR);
router.delete('/ServiceSor/:serviceSOR_ID', authenticate,Userverifiction,ensureSequelizeInstance,serviceSOR.deleteServiceSOR);

module.exports = router;
