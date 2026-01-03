const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

// Registration routes (public - no admin required)
router.post('/register', authController.registerUser);
router.post('/register/verify', authController.verifyUserRegistration);

// Login routes
router.post('/login', authController.loginUser);
router.post('/google', authController.googleAuth);

// GitHub OAuth routes
router.get('/github/oauth', verifyToken, authController.initiateGitHubOAuth);
router.get('/github/callback', authController.handleGitHubCallback);

// GitHub token management (protected routes)
router.post('/github-token', verifyToken, authController.saveGitHubToken);
router.get('/github-token/status', verifyToken, authController.getGitHubTokenStatus);
router.delete('/github-token', verifyToken, authController.removeGitHubToken);

// Debug routes (development only)
router.get('/debug/pending', authController.getPendingRegistrations);
router.get('/debug/otp/:email', authController.getOTPForEmail);

module.exports = router;
