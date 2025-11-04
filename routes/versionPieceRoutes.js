const express = require('express');
const router = express.Router();
const versionPieceController = require('../controllers/versionPieceController');

// Récupérer toutes les versions
router.get('/', versionPieceController.getAllVersions);

// Ajouter une nouvelle version
router.post('/', versionPieceController.createVersion);

// Supprimer une version
router.delete('/:version', versionPieceController.deleteVersion);

router.get('/revision', versionPieceController.getLatestVersionByPiece);



module.exports = router;
