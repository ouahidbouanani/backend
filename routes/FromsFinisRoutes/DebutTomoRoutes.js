const express = require('express');
const router = express.Router();
const debutTomoController = require('../../controllers/FormulairesFinis/DebutTomoController');


// Enregistrer un début de tomographie
router.post('/', debutTomoController.create);

router.get('/lots', debutTomoController.getLots);
module.exports = router;