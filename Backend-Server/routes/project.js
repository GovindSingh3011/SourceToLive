const express = require('express');
const router = express.Router();
const { createProject, streamLogs, getArchivedLogs, listProjects, getProject } = require('../controllers/projectController');

router.get('/', listProjects);
router.get('/:projectId', getProject);
router.post('/', createProject);
router.get('/:projectId/logs/stream', streamLogs);
router.get('/:projectId/logs/archive', getArchivedLogs);

module.exports = router;
