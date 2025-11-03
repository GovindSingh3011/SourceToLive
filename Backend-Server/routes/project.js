const express = require('express');
const router = express.Router();
const { createProject, streamLogs, getArchivedLogs } = require('../controllers/projectController');

router.post('/', createProject);
router.get('/:projectId/logs/stream', streamLogs);
router.get('/:projectId/logs/archive', getArchivedLogs);

module.exports = router;
