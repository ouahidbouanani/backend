const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
//register
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);

//login
router.post('/login', authController.login);
router.get('/protected', authController.protectedRoute);

module.exports = router;
