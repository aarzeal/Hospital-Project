const express = require("express");
const router = express.Router();

const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");

const {
  createUserRights,
  getAllUserRights,
  getUserRightById,
  updateUserRightById,
  deleteUserRightById,
} = require("../controllers/userRightsCRUDController");

// CREATE User Right
router.post(
  "/create-user-right",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createUserRights
);

// GET All User Rights
router.get(
  "/all-user-rights",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllUserRights
);

// GET User Right By ID
router.get(
  "/user-right/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserRightById
);

// UPDATE User Right
router.put(
  "/update-user-right/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateUserRightById
);

// DELETE User Right
router.delete(
  "/delete-user-right/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteUserRightById
);


module.exports = router;
