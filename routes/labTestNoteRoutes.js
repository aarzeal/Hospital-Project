const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const {
  createLabTestNote,
  getAllLabTestNote,
  getLabTestNoteById,
  updateLabTestNoteById,
  deleteLabTestNoteById,
  getLabTestNoteByQueryParams,
} = require("../controllers/labTestNotesController");

router.post(
  "/create-lab-test-note",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabTestNote
);
router.get(
  "/all-lab-test-notes",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabTestNote
);

router.get(
  "/lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestNoteById
);

router.put(
  "/update-lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateLabTestNoteById
);

router.delete(
  "/delete-lab-test-note/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteLabTestNoteById
);

router.get(
  "/lab-test-note-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabTestNoteByQueryParams
);

module.exports = router;
