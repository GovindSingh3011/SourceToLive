const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    handleGitHubWebhook,
    handleGitLabWebhook,
    enableAutoRedeploy,
    disableAutoRedeploy,
    getWebhookStatus,
} = require('../controllers/webhookController');

// Webhook endpoints (public - for GitHub/GitLab to call)
router.post('/github/:projectId', handleGitHubWebhook);
router.post('/gitlab/:projectId', handleGitLabWebhook);

// Management endpoints (protected with auth middleware)
router.post('/enable/:projectId', verifyToken, enableAutoRedeploy);
router.post('/disable/:projectId', verifyToken, disableAutoRedeploy);
router.get('/status/:projectId', verifyToken, getWebhookStatus);

module.exports = router;
