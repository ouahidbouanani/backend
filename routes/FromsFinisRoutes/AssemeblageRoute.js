const express = require('express');
const router = express.Router();
const controller = require('../../controllers/FormulairesFinis/AssemblageController');


// Ajouter un nouvel enregistrement
router.post('/add', controller.addAssemblage);

module.exports =router;