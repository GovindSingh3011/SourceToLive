const express = require('express');
const router = express.Router();
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

// Management endpoints (should be protected with auth middleware if needed)
router.post('/enable/:projectId', enableAutoRedeploy);
router.post('/disable/:projectId', disableAutoRedeploy);
router.get('/status/:projectId', getWebhookStatus);

module.exports = router;
