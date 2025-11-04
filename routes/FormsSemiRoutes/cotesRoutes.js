const express = require('express');
const router = express.Router();
const cotesController = require('../../controllers/FormulairesSemi/cotesController');

router.get('/lot/:id_lot/:nb_passage', cotesController.getCotesByLotId);

module.exports = router;
