const express = require("express");
const { createLedger } = require("../controllers/accLedgerController");

const router = express.Router();

router.post("/create_accLedger", createLedger);

module.exports = router;
