const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemConfigController');

// Routes activités
router.get('/activites', controller.getAllActivities);
router.post('/activites', controller.createActivity);

// Routes imprimantes
router.get('/imprimantes', controller.getAllPrinters);
router.post('/imprimantes', controller.createPrinter);

module.exports = router;
