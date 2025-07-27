const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");

const { 
  createLabTestCategoryDetails, 
  getAllLabTestCategoryDetails, 
  getLabTestCategoryDetailsById,
   updateLabTestCategoryDetails, 
   deleteLabTestCategoryDetails, 
   getLinkedTestsByCategoryId,
   getLabTestCategoryDetailsByQueryParams } = require("../controllers/labTestCategoryDetailsController");

router.post(
  "/create-lab-test-category-details",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestCategoryDetails
);
router.get(
  "/all-lab-test-categories-details",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestCategoryDetails
);

router.get(
  "/lab-test-category-details/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestCategoryDetailsById
);

router.get(
  "/categories/:categoryId/linked-test",  // Matches your preferred URL pattern
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLinkedTestsByCategoryId
);


router.put(
  "/update-lab-test-category-details/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestCategoryDetails
);

router.delete(
  "/delete-lab-test-category-details/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestCategoryDetails
);

router.get(
  "/lab-test-category-details-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestCategoryDetailsByQueryParams
);

module.exports = router;
