const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration routes (public - no admin required)
router.post('/register', authController.registerUser);
router.post('/register/verify', authController.verifyUserRegistration);

// Login routes
router.post('/login', authController.loginUser);
router.post('/google', authController.googleAuth);

// Debug routes (development only)
router.get('/debug/pending', authController.getPendingRegistrations);
router.get('/debug/otp/:email', authController.getOTPForEmail);

module.exports = router;
