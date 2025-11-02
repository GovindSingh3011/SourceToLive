const express = require('express');
const router = express.Router();
const { createProject } = require('../controllers/projectController');

// POST /project
router.post('/', createProject);

module.exports = router;
