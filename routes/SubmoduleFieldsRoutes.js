const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require('../controllers/HospitalController');
const { createSubmoduleField, bulkCreateSubmoduleFields, getAllSubmoduleFields, getSubmoduleFieldById, updateSubmoduleFieldById, deleteSubmoduleFieldById, getSubmoduleFieldsByQueryParams, importSubmoduleFieldsFromExcel, getSubmoduleFieldsBySubmoduleId, getSubmodulesByFieldId, bulkUpdateSubmoduleFieldsBySubmoduleId } = require("../controllers/submoduleFieldsController");
const upload = require("../Middleware/hopsitallogo");


// CREATE single permission
router.post(
  "/create-submodule-fields",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createSubmoduleField
);

router.post(
  "/bulk-create-submodule-fields",  // ✅ new bulk route
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  bulkCreateSubmoduleFields
);

router.post(
  "/import-submodule-fields-excel",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  upload.single("file"),     
  importSubmoduleFieldsFromExcel
);

// GET all permissions (optional, admin)
router.get(
  "/all-submodule-fields",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllSubmoduleFields
);

// GET permission by submodule ID
router.get(
  "/submodule-fields/submodule-fields/:submoduleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getSubmoduleFieldsBySubmoduleId
);

// GET permission by field ID
router.get(
  "/submodule-fields/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getSubmodulesByFieldId
);


// UPDATE permission by ID
router.put(
  "/update-submodule-fields/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateSubmoduleFieldById
);
// BULK UPDATE permission by ID

router.put(
  "/update-bulk-submodule-fields/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  bulkUpdateSubmoduleFieldsBySubmoduleId
);



// DELETE permission by ID
router.delete(
  "/delete-submodule-fields/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteSubmoduleFieldById
);

// GET permissions as per query params (pagination/filtering)
router.get(
  "/submodule-fields-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getSubmoduleFieldsByQueryParams
);

module.exports = router;
