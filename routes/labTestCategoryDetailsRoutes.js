const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const {
  createLabTestCategory,
  getAllLabTestCategories,
  getLabTestCategoryById,
  updateLabTestCategory,
  deleteLabTestCategory,
  getLabTestCategoryByQueryParams,
} = require("../controllers/labTestCategoryController");

router.post(
  "/create-lab-test-category",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestCategory
);
router.get(
  "/all-lab-test-categories",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestCategories
);

router.get(
  "/lab-test-category/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestCategoryById
);

router.put(
  "/update-lab-test-category/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestCategory
);

router.delete(
  "/delete-lab-test-category/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestCategory
);

router.get(
  "/lab-test-category-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestCategoryByQueryParams
);

module.exports = router;
