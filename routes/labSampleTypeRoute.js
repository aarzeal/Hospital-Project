const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const {
  createLabSampleType,
  getAllLabSampleTypes,
  getLabSampleTypeById,
  updateLabSampleTypeById,
  deleteLabSampleTypeById,
  getLabSampleTypeByQueryParams,
} = require("../controllers/labSampleTypeController");

router.post(
  "/create-lab-sample-type",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabSampleType
);
router.get(
  "/all-lab-sample-types",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabSampleTypes
);

router.get(
  "/lab-sample-type/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabSampleTypeById
);

router.put(
  "/update-lab-sample-type/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabSampleTypeById
);

router.delete(
  "/delete-lab-sample-type/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabSampleTypeById
);

router.get(
  "/lab-sample-type-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabSampleTypeByQueryParams
);

module.exports = router;
