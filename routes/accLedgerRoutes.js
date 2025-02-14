// const express = require("express");
// const { createLedger } = require("../controllers/accLedgerController");

// const router = express.Router();

// router.post("/create_accLedger", createLedger);

// module.exports = router;

const express = require('express');
const router = express.Router();
const accLedgerController = require('../controllers/accLedgerController');
const authenticate = require('../validators/authenticate');

router.post('/acc-Ledger', authenticate,accLedgerController.ensureSequelizeInstance,accLedgerController.createAccLedger);
router.get('/acc-Ledger', authenticate,accLedgerController.ensureSequelizeInstance,accLedgerController.getAccLedger);
// router.get('/acc-Ledger/:id', authenticate,accLedgerController.ensureSequelizeInstance,accLedgerController.manageAccLedger);

module.exports = router;
