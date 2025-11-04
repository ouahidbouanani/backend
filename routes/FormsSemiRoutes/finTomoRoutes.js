const express = require('express')
const router = express.Router()
const finTomoController = require('../../controllers/FormulairesSemi/finTomoController')

router.post('/add', finTomoController.create)
router.get('/all', finTomoController.getAll)

// Obtenir tous les lots disponibles depuis la table debut_Tomo
router.get('/lots', finTomoController.getLots);

module.exports = router
