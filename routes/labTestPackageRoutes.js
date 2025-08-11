const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const { createLabTestPackage, getAllLabTestPackage, getLabTestPackageById, updateLabTestPackage, deleteLabTestPackage, getLabTestPackageByQueryParams } = require("../controllers/labTestPackageController");


router.post(
  "/create-lab-test-package",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestPackage
);
router.get(
  "/all-lab-test-package",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestPackage
);

router.get(
  "/lab-test-package/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestPackageById
);

router.put(
  "/update-lab-test-package/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestPackage
);

router.delete(
  "/delete-lab-test-package/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestPackage
);

router.get(
  "/lab-test-package-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestPackageByQueryParams
);

module.exports = router;
