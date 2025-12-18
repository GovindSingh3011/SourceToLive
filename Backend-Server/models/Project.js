const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    gitRepositoryUrl: {
        type: String,
        required: true,
        trim: true,
    },
    deployUrl: {
        type: String,
        default: null,
        trim: true,
    },
    status: {
        type: String,
        enum: ['queued', 'running', 'finished', 'failed'],
        default: 'queued',
    },
    logsS3Key: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
