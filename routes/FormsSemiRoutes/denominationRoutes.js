const express = require('express');
const router = express.Router();
const denominationController = require('../../controllers/FormulairesSemi/denominationController');

router.get('/', denominationController.getAllDenominations);
router.post('/', denominationController.createDenomination);

module.exports = router;
