const express = require("express");
const router = express.Router();

const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require("../controllers/HospitalController");

const {
  createUserFieldPermission,
  createUserFieldPermissionsBulk,
  getAllUserFieldPermissions,
  getUserFieldPermissionsByUserId,
  updateUserFieldPermissionById,
  deleteUserFieldPermissionById,
  getUserFieldPermissionByQueryParams,
  getUserFieldPermissionsByFieldId,
  getUserFieldPermissionsBySubModuleId,
  bulkUpdateUserFieldPermission,
  getAllUserFieldAccessByUserAndSubmodule
} = require("../controllers/userFieldsPermissionController");


// ---------------- CREATE ----------------

// Single create
router.post(
  "/create-user-fields-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createUserFieldPermission
);

// Bulk create
router.post(
  "/create-user-fields-permissions-bulk",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createUserFieldPermissionsBulk
);


// ---------------- GET ----------------

router.get(
  "/all-user-fields-permissions",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllUserFieldPermissions
);

router.get(
  "/user-fields-permission/:userId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserFieldPermissionsByUserId
);

router.get(
  "/user-fields-permission-by-submodule/:submoduleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserFieldPermissionsBySubModuleId
);

router.get(
  "/user-fields-permissions/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserFieldPermissionsByFieldId
);

router.get(
  "/user-fields-permission-by-user-and-submodule/:userId/:submoduleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllUserFieldAccessByUserAndSubmodule
);


// ---------------- UPDATE ----------------

router.put(
  "/update-user-fields-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateUserFieldPermissionById
);

router.put(
  "/update-user-fields-permission-bulk",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  bulkUpdateUserFieldPermission
);


// ---------------- DELETE ----------------

router.delete(
  "/delete-user-fields-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteUserFieldPermissionById
);


// ---------------- QUERY PARAMS ----------------

router.get(
  "/user-fields-permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserFieldPermissionByQueryParams
);

module.exports = router;
