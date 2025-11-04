const express = require('express');
const router = express.Router();
const finEtchingController = require('../../controllers/FormulairesSemi/finEtchingController');

// Obtenir tous les lots disponibles depuis la table debut_etching
router.get('/lots', finEtchingController.getLots);

// Obtenir les données (wafer + dernier passage) pour un lot donné
router.get('/lot-info/:lotId', finEtchingController.getLotInfo);

// Ajouter un enregistrement de fin etching
router.post('/add', finEtchingController.addFinEtching);

module.exports = router;
