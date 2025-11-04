const express = require("express");
const router = express.Router();
const suiviController = require("../../controllers/FormulairesSemi/suiviController");

router.get("/lots", suiviController.getLotsProgress);

module.exports = router;
