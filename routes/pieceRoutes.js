const express = require("express");
const router = express.Router();
const pieceController = require("../controllers/pieceController");

//ajouter une pièce
router.post("/pieces", pieceController.ajouterPiece);

//récuperer tous les pièces
router.get('/pieces', pieceController.getAllPieces);

//récuperer tous les nom des pieces disponible
router.get('/pieces_nom', pieceController.getAllPiecesName);

// récuperer les données d'une pièce a partir de son id
router.get('/pieces/:id', pieceController.getPieceById);

//modifier une pièce
router.put('/pieces/:id', pieceController.updatePiece);

//supprimer 
router.delete('/pieces/:id', pieceController.deletePiece);

// Route pour récupérer les types de pièces
router.get('/types', pieceController.getTypePieces)

module.exports = router;
