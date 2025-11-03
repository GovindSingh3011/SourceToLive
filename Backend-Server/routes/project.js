const express = require('express');
const router = express.Router();
const { createProject, streamLogs } = require('../controllers/projectController');

router.post('/', createProject);
router.get('/:projectId/logs/stream', streamLogs);

module.exports = router;
