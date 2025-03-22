// const express = require("express");
// const { createService,getAllAndGetById,updateService,deleteService,ensureSequelizeInstance } = require("../controllers/serviceController");
// const authenticate = require('../Middleware/verifyAccesstoken');
// const router = express.Router();

// router.post("/create_service",authenticate,ensureSequelizeInstance, createService);
// router.get("/service",getAllAndGetById );
// router.put("/update/:service_id", updateService);
// router.delete("/delete/:service_id", deleteService);

// module.exports = router;

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateService  = require('../validators/Servicesvalidator');
const Userverifiction = require('../validators/Accesstokenverify');

router.post('/service', validateService.validateService,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,serviceController.createService);
router.get('/service', authenticate,Userverifiction,ensureSequelizeInstance,serviceController.getService);
router.get('/service/:id', authenticate,Userverifiction,ensureSequelizeInstance,serviceController.getService);
router.get('/service-type/:service_type', authenticate,Userverifiction,ensureSequelizeInstance,serviceController.getServicebyservicetype);
router.put("/update/:id", validateService.validateServiceUpdate,validateJSONContentType,authenticate,Userverifiction,ensureSequelizeInstance,serviceController.updateService);
router.delete("/delete/:service_id", authenticate,Userverifiction,ensureSequelizeInstance,serviceController.deleteService);


module.exports = router;
