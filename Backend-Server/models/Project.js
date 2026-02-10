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
    autoRedeploy: {
        type: Boolean,
        default: false,
    },
    webhookSecret: {
        type: String,
        default: null,
    },
    webhookId: {
        type: String,
        default: null,
    },
    owner: {
        userId: {
            type: Number,
            default: null,
            index: true,
        },
        id: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            default: null,
            trim: true,
        },
        email: {
            type: String,
            default: null,
            trim: true,
        },
    },
    lastCommitHash: {
        type: String,
        default: null,
    },
    lastCommitMessage: {
        type: String,
        default: null,
        trim: true,
    },
    buildConfig: {
        installCmd: {
            type: String,
            default: 'npm install',
        },
        buildCmd: {
            type: String,
            default: 'npm run build',
        },
        buildRoot: {
            type: String,
            default: null,
        },
    },
    environmentVariables: [
        {
            key: {
                type: String,
                required: true,
                trim: true,
            },
            value: {
                type: String,
                required: true,
            },
            _id: false,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
