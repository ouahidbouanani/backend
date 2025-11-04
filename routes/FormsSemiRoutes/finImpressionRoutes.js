const express = require('express');
const router = express.Router();
const controller = require('../../controllers/FormulairesSemi/finImpressionController');

// Ajouter une nouvelle fin d'impression
router.post('/', controller.dbInsertFinImpression);

// Obtenir tous les lots
router.get('/lots', controller.getAllLots);

// Obtenir les détails d’un lot
router.get('/lot/:id', controller.getLotDetails);

module.exports = router;
