
const express = require('express')
const router = express.Router()
const piecesController = require('../../controllers/FormulairesSemi/priseCotesController')

router.get('/lots', piecesController.getLots)
router.post('/pieces/submit', piecesController.submitPieces)
router.post('/pieces/ajouter', piecesController.ajouterPriseCotes)
router.get('/lots/piece/:id_lot', piecesController.GetTypePiece)
router.get('/mesures/:id_lot/:nb_passage', piecesController.getMesuresByLotAndPassage)
module.exports = router
