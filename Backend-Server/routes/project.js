const express = require('express');
const router = express.Router();
const { createProject, streamLogs, getArchivedLogs, listProjects, getProject } = require('../controllers/projectController');
const verifyToken = require('../middleware/verifyToken');
const isUser = require('../middleware/isUser');

router.get('/', verifyToken, isUser, listProjects);
router.get('/:projectId', verifyToken, getProject);
router.post('/', verifyToken, isUser, createProject);
router.get('/:projectId/logs/stream', streamLogs);
router.get('/:projectId/logs/archive', getArchivedLogs);

module.exports = router;
