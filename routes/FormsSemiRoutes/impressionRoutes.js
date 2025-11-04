const express = require('express')
const router = express.Router()
const impressionController = require('../../controllers/FormulairesSemi/impressionController')

// Routes
router.post('/ajouter', impressionController.addImpression)
router.get('/', impressionController.getImpressions) 

module.exports = router
