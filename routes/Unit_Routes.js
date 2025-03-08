
const express = require('express')

const unit_Controlelr = require('../controllers/Unit_Controller')
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validator = require('../validators/Servicesvalidator')


const { route } = require('./userRoutes')
const router = require('./userRoutes')


router.post("/creat-unit", authenticate,validateJSONContentType,validator.validateUnit,ensureSequelizeInstance, unit_Controlelr.createUnit)
router.get("/get-unit", validateJSONContentType,authenticate,ensureSequelizeInstance,unit_Controlelr.getUnits)
router.put('/put-unit/:unit_ID', validateJSONContentType , authenticate,validator.validateUnitUpdate,ensureSequelizeInstance, unit_Controlelr.updateUnit)
router.get('/get-unit/:unit_ID', validateJSONContentType , authenticate,ensureSequelizeInstance, unit_Controlelr.getUnitById)
router.delete('/delete-unit/:unit_ID', validateJSONContentType , authenticate,ensureSequelizeInstance, unit_Controlelr.deleteUnit)
module.exports = router;