const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require('../controllers/HospitalController');
const { 
  createUserPermission,
  getAllUserPermissions,
  getUserPermissionById,
  getPermissionsByUserId,
  updateUserPermissionById,
  deleteUserPermissionById,
  getUserPermissionByQueryParams,
  bulkCreateUserPermissions,
  toggleUserPermissionStatus
} = require("../controllers/UserPermissionController");

// CREATE single permission
router.post(
  "/create-user-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createUserPermission
);

router.post(
  "/bulk-create-user-permissions",  // ✅ new bulk route
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  bulkCreateUserPermissions
);
// GET all permissions (optional, admin)
router.get(
  "/all-user-permissions",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllUserPermissions
);

// GET permission by ID
router.get(
  "/user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserPermissionById
);

// GET permissions by userId (main use case)
router.get(
  "/user-permissions/user/:userId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getPermissionsByUserId
);

// UPDATE permission by ID
router.put(
  "/update-user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateUserPermissionById
);

// TOGGLE user permission (active / inactive)
router.patch(
  "/toggle-user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  toggleUserPermissionStatus
);


// DELETE permission by ID
router.delete(
  "/delete-user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteUserPermissionById
);

// GET permissions as per query params (pagination/filtering)
router.get(
  "/user-permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserPermissionByQueryParams
);

module.exports = router;
