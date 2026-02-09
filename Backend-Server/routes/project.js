const express = require('express');
const router = express.Router();
const { createProject, streamLogs, getArchivedLogs, listProjects, getProject, redeploy, updateProject, deleteProject, setupWebhook, deleteWebhook, fetchGitHubRepositories } = require('../controllers/projectController');
const verifyToken = require('../middleware/verifyToken');
const isUser = require('../middleware/isUser');

router.get('/', verifyToken, isUser, listProjects);
router.get('/repositories/github', verifyToken, isUser, fetchGitHubRepositories);
router.get('/:projectId', verifyToken, getProject);
router.post('/', verifyToken, isUser, createProject);
router.put('/:projectId', verifyToken, isUser, updateProject);
router.delete('/:projectId', verifyToken, isUser, deleteProject);
router.get('/:projectId/logs/stream', streamLogs);
router.get('/:projectId/logs/archive', getArchivedLogs);
router.post('/:projectId/redeploy', verifyToken, isUser, redeploy);
router.post('/:projectId/webhook/setup', verifyToken, isUser, setupWebhook);
router.post('/:projectId/webhook/delete', verifyToken, isUser, deleteWebhook);

module.exports = router;
