const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");

const { 
  createLabTestSensitivity, 
  getAllLabTestSensitivity, 
   updateLabTestSensitivityById, 
   deleteLabTestSensitivityById, 
   getLabTestSensitivityByQueryParams, 
   getLabTestSensitivityById} = require("../controllers/labTestSensitivityController");

router.post(
  "/create-lab-test-sensitivity",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestSensitivity
);
router.get(
  "/all-lab-test-sensitivity",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestSensitivity
);

router.get(
  "/lab-test-sensitivity/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestSensitivityById
);

router.put(
  "/update-lab-test-sensitivity/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestSensitivityById
);

router.delete(
  "/delete-lab-test-sensitivity/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestSensitivityById
);

router.get(
  "/lab-test-sensitivity-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestSensitivityByQueryParams
);

module.exports = router;
