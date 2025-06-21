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
} = require("../controllers/labTestCategoryController");

router.post(
  "/create-lab-test-note",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestCategory
);
router.get(
  "/all-lab-test-notes",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestCategories
);

router.get(
  "/lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestCategoryById
);

router.put(
  "/update-lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestCategory
);

router.delete(
  "/delete-lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestCategory
);

router.get(
  "/lab-test-note-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestNoteByQueryParams
);

module.exports = router;
