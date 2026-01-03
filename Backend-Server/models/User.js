const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    hashedPassword: {
        type: String,
        required: false  // Not required for Google OAuth users
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true  // Allows null values
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    avatar: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    githubAccessToken: {
        type: String,
        default: null,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
