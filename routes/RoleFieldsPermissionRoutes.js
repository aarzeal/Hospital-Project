const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require('../controllers/HospitalController');
const { 
  createRoleFieldPermission, 
  createRoleFieldPermissionsBulk, 
  getAllRoleFieldPermissions, 
  getRoleFieldPermissionsByRoleId, 
  updateRoleFieldPermissionById, 
  deleteRoleFieldPermissionById,
  getRoleFieldPermissionByQueryParams,
  getRoleFieldPermissionsByFieldId,
  getRoleFieldPermissionsBySubModuleId,
  bulkUpdateRoleFieldPermission,
  getAllRoleFieldAccessByRoleAndSubmodule
} = require("../controllers/roleFieldsPermissionController");

// Existing single create route
router.post(
  "/create-role-fields-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createRoleFieldPermission
);

// New bulk create route
router.post(
  "/create-role-fields-permissions-bulk",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createRoleFieldPermissionsBulk
);

router.get(
  "/all-role-fields-permissions",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllRoleFieldPermissions
);

router.get(
  "/role-fields-permission/:roleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleFieldPermissionsByRoleId
);

router.get(
  "/role-fields-permission-by-submodule/:submoduleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleFieldPermissionsBySubModuleId
);

router.get(
  "/role-fields-permissions/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleFieldPermissionsByFieldId
);

router.get(
  "/role-fields-permission-by-role-and-submodule/:roleId/:submoduleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllRoleFieldAccessByRoleAndSubmodule
);



router.put(
  "/update-role-fields-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateRoleFieldPermissionById
);

router.put(
  "/update-role-fields-permission-bulk",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  bulkUpdateRoleFieldPermission
);



// Delete route
router.delete(
  "/delete-role-fields-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteRoleFieldPermissionById
);

// Query params route
router.get(
  "/role-fields-permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleFieldPermissionByQueryParams
);


module.exports = router;