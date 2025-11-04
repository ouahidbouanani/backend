const express = require('express');
const router = express.Router();
const debutTomoController = require('../../controllers/FormulairesSemi/debutTomoController');

// Enregistrer un début de tomographie
router.post('/', debutTomoController.create);

// Récupérer tous les débuts tomographie (optionnel)
router.get('/', debutTomoController.getAll);

// Obtenir tous les lots disponibles depuis la table debut_etching
router.get('/lots', debutTomoController.getLots);

module.exports = router;
