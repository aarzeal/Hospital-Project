const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const { createRole, getAllRoles, getRoleById, updateRoleById, deleteRoleById, getRoleByQueryParams } = require("../controllers/roleController");
const hospitalController = require('../controllers/HospitalController');



router.post(
  "/create-role",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createRole
);
router.get(
  "/all-roles",
  authenticate,
  // ensureSequelizeInstance,
  // Userverification,
hospitalController.ensureSequelizeInstance,
  getAllRoles
);

router.get(
  "/role/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleById
);

router.put(
  "/update-role/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateRoleById
);

router.delete(
  "/delete-role/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteRoleById
);

router.get(
  "/role-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRoleByQueryParams
);

module.exports = router;
