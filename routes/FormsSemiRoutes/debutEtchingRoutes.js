// routes/debutEtchingRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/FormulairesSemi/debutEtchingController');

// Récupérer les lots depuis la table fin_impression
router.get('/lots', controller.getLots)

// Ajouter un nouvel enregistrement dans debut_etching
router.post('/add', controller.addDebutEtching)

// Route pour obtenir toutes les données de la table debut_etching pour l'affihcher dans le tableau
router.get('/all', controller.getAllDebutEtching)

router.get('/count/:lotId', controller.getNbPassages)
module.exports = router
