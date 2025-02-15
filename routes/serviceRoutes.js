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

router.post('/service', validateJSONContentType,authenticate,ensureSequelizeInstance,serviceController.createService);
router.get('/service', authenticate,ensureSequelizeInstance,serviceController.getService);
router.get('/service/:id', authenticate,ensureSequelizeInstance,serviceController.getService);
router.put("/update/:id", validateJSONContentType,authenticate,ensureSequelizeInstance,serviceController.updateService);
router.delete("/delete/:service_id", authenticate,ensureSequelizeInstance,serviceController.deleteService);


module.exports = router;
