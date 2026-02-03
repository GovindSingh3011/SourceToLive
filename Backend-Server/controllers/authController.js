const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const transporter = require('../utils/emailTransporter');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');

const generateUserId = async () => {
    let lastUser = await User.findOne().sort({ userId: -1 });
    return lastUser ? lastUser.userId + 1 : 1000; // userId starts with 1000
};

// In-memory store for pending registration
// Key: email, Value: {userData, OTP, expiresAt}
const pendingRegistrations = new Map();

// Public registration - anyone can register
const registerUser = async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        const { firstName, lastName, email } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        if (pendingRegistrations.has(email)) {
            return res.status(429).json({ message: "Registration already initiated. Please verify OTP sent to email." });
        }

        // Generate unique user ID automatically
        const userId = await generateUserId();
        const otp = generateOTP();
        const expiresAt = Date.now() + 3 * 60 * 1000;

        pendingRegistrations.set(email, {
            userData: { firstName, lastName, email, userId },
            otp,
            expiresAt
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
            to: email,
            subject: "Verify Your Email - SourceToLive",
            text: `Hello ${firstName},\n\nWelcome to SourceToLive!\n\nYour OTP to complete registration is: ${otp}\nIt will expire in three minutes.\n\nPlease set up your password after verification.\n\nIf you did not initiate this registration, please ignore this email.`
        };

        // ===== DEVELOPMENT: LOG OTP TO CONSOLE =====
        console.log('\n🔑 ========================================');
        console.log(`🔑 OTP FOR ${email}: ${otp}`);
        console.log('🔑 Expires at:', new Date(expiresAt).toLocaleString());
        console.log('🔑 ========================================\n');

        try {
            console.log(`📧 Sending OTP email to: ${email}`);
            const emailResult = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', emailResult.messageId);
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            console.error('❌ Full error:', emailError);
            pendingRegistrations.delete(email); // Clean up pending registration
            return res.status(500).json({
                message: "Failed to send OTP email. Please check email configuration.",
                error: emailError.message
            });
        }

        return res.status(200).json({
            message: "OTP sent to your email. Please verify to complete registration.",
            userId: userId,
            ...(process.env.NODE_ENV === 'development' && { devOtp: otp }) // Include OTP in dev mode
        });
    } catch (error) {
        console.error("Error initiating user registration: ", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

const verifyUserRegistration = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: "Email, OTP, and password are required" });
        }

        const pending = pendingRegistrations.get(email);
        if (!pending) {
            return res.status(400).json({ message: "No pending registration found for this email. Please initiate registration again." });
        }

        if (Date.now() > pending.expiresAt) {
            pendingRegistrations.delete(email);
            return res.status(410).json({ message: "OTP expired. Please initiate registration again." });
        }

        if (otp !== pending.otp) {
            return res.status(401).json({ message: "Invalid OTP. Please try again." });
        }

        const { firstName, lastName, userId } = pending.userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User(
            {
                firstName,
                lastName,
                email,
                hashedPassword,
                userId,
            });

        await newUser.save();
        pendingRegistrations.delete(email);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                userId: newUser.userId,
                email: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`
            }
        });
    } catch (error) {
        console.error("Error verifying OTP and registering user: ", error);
        return res.status(500).json({ message: 'Server Error' });
    }
}

// Login with email and password
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: "Your account has been deactivated" });
        }

        // Check if user registered with Google
        if (user.authProvider === 'google') {
            return res.status(400).json({ message: "This account uses Google login. Please sign in with Google." });
        }

        if (!user.hashedPassword) {
            return res.status(400).json({ message: "Password not set for this account" });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user.userId,
                role: user.role,
                isActive: user.isActive,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Google OAuth login/register
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential token is required" });
        }

        // Verify the Google token
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (verifyError) {
            console.error("Google token verification failed:", verifyError);
            return res.status(401).json({ message: "Invalid Google token" });
        }

        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const firstName = payload.given_name || payload.name?.split(' ')[0] || 'User';
        const lastName = payload.family_name || payload.name?.split(' ')[1] || '';
        const avatar = payload.picture;

        console.log('✅ Google OAuth verified:', { email, firstName, lastName });

        // Check if user exists
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // User exists - update Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
            }
            if (avatar && !user.avatar) {
                user.avatar = avatar;
            }
            await user.save();
            console.log('✅ Existing user logged in via Google:', user.email);
        } else {
            // Create new user with Google auth
            const userId = await generateUserId();
            user = new User({
                firstName,
                lastName,
                email,
                googleId,
                authProvider: 'google',
                userId,
                avatar,
                isActive: true
            });
            await user.save();
            console.log('✅ New user created via Google:', user.email);
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: "Your account has been deactivated" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user.userId,
                role: user.role,
                isActive: user.isActive,
                avatar: user.avatar,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("❌ Google Auth Error:", error);
        return res.status(500).json({
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Debug function to check pending registrations (for development only)
const getPendingRegistrations = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: 'Not found' });
    }

    const pending = [];
    for (const [email, data] of pendingRegistrations.entries()) {
        pending.push({
            email,
            userId: data.userData.userId,
            otp: data.otp, // Only show in development
            expires: new Date(data.expiresAt).toISOString(),
            isExpired: Date.now() > data.expiresAt
        });
    }

    // Also include mock email info if using mock service
    let mockEmailInfo = null;
    if (transporter.isUsingMockService && transporter.isUsingMockService()) {
        mockEmailInfo = {
            isUsingMockService: true,
            sentEmails: transporter.getSentEmails ? transporter.getSentEmails() : [],
            instruction: 'Check console logs for OTP codes when using mock email service'
        };
    }

    return res.status(200).json({
        message: 'Debug information (development only)',
        pendingRegistrations: {
            count: pending.length,
            registrations: pending
        },
        emailService: mockEmailInfo
    });
};

// Get OTP for email (development only)
const getOTPForEmail = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: 'Not found' });
    }

    const { email } = req.params;

    // Check pending registrations first
    const pending = pendingRegistrations.get(email);
    if (pending) {
        return res.status(200).json({
            email,
            otp: pending.otp,
            expires: new Date(pending.expiresAt).toISOString(),
            isExpired: Date.now() > pending.expiresAt,
            source: 'pending_registration'
        });
    }

    // If using mock service, get OTP from mock emails
    if (transporter.isUsingMockService && transporter.isUsingMockService() && transporter.getLatestOTP) {
        const otp = transporter.getLatestOTP(email);
        if (otp) {
            return res.status(200).json({
                email,
                otp,
                source: 'mock_email_service'
            });
        }
    }

    return res.status(404).json({
        message: 'No OTP found for this email',
        email
    });
};

/** * Initiate GitHub OAuth flow
 * GET /api/auth/github/oauth
 */
const initiateGitHubOAuth = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!config.GITHUB_CLIENT_ID) {
            return res.status(500).json({
                message: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID in environment variables.'
            });
        }

        // Required scopes for webhook creation and repo access
        const scopes = ['repo', 'admin:repo_hook'].join(' ');

        // Build GitHub OAuth URL
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.append('client_id', config.GITHUB_CLIENT_ID);
        githubAuthUrl.searchParams.append('redirect_uri', config.GITHUB_CALLBACK_URL);
        githubAuthUrl.searchParams.append('scope', scopes);
        githubAuthUrl.searchParams.append('state', userId ? userId.toString() : '');
        // Force user to login again and select account (doesn't auto-connect to previous login)
        githubAuthUrl.searchParams.append('prompt', 'consent');

        return res.json({
            authUrl: githubAuthUrl.toString()
        });
    } catch (error) {
        console.error('GitHub OAuth initiation error:', error);
        return res.status(500).json({
            message: 'Failed to initiate GitHub OAuth',
            error: error.message
        });
    }
};

/**
 * Handle GitHub OAuth callback
 * GET /api/auth/github/callback
 */
const handleGitHubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect(`${config.FRONTEND_URL}/settings?error=No authorization code received`);
        }

        if (!config.GITHUB_CLIENT_ID || !config.GITHUB_CLIENT_SECRET) {
            return res.redirect(`${config.FRONTEND_URL}/settings?error=GitHub OAuth not configured`);
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: config.GITHUB_CLIENT_ID,
                client_secret: config.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: config.GITHUB_CALLBACK_URL
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error || !tokenData.access_token) {
            return res.redirect(`${config.FRONTEND_URL}/settings?error=${encodeURIComponent(tokenData.error_description || 'Failed to get access token')}`);
        }

        const accessToken = tokenData.access_token;

        // Verify token and get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!userResponse.ok) {
            return res.redirect(`${config.FRONTEND_URL}/settings?error=Failed to verify GitHub token`);
        }

        const githubUser = await userResponse.json();

        // Get user from state (userId)
        const userId = state ? parseInt(state) : null;

        if (!userId) {
            return res.redirect(`${config.FRONTEND_URL}/settings?error=User not authenticated`);
        }

        // Save token to user
        await User.findOneAndUpdate(
            { userId },
            { githubAccessToken: accessToken }
        );

        // Redirect back to add-project with success
        return res.redirect(`${config.FRONTEND_URL}/add-project?github_connected=true`);

    } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        return res.redirect(`${config.FRONTEND_URL}/add-project?error=${encodeURIComponent(error.message)}`);
    }
};

/** * Validate GitHub token permissions and save it
 * POST /api/auth/github-token
 * Body: { token: string }
 */
const saveGitHubToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.userId; // From verifyToken middleware

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'GitHub token is required' });
        }

        // Validate token by checking user permissions
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            return res.status(401).json({
                message: 'Invalid GitHub token',
                error: 'Token authentication failed'
            });
        }

        const userData = await response.json();

        // Check token scopes from headers
        const scopes = response.headers.get('x-oauth-scopes') || '';
        const scopeList = scopes.split(',').map(s => s.trim());

        // Required permissions:
        // - repo (includes contents:read and webhook:write)
        // OR
        // - public_repo + admin:repo_hook (for public repos only)
        const hasFullRepoAccess = scopeList.includes('repo');
        const hasPublicRepoAccess = scopeList.includes('public_repo');
        const hasWebhookAccess = scopeList.includes('admin:repo_hook') || scopeList.includes('write:repo_hook');

        if (!hasFullRepoAccess && !(hasPublicRepoAccess && hasWebhookAccess)) {
            return res.status(400).json({
                message: 'Insufficient token permissions',
                required: 'Token must have "repo" scope (for all repos) OR "public_repo" + "admin:repo_hook" (for public repos only)',
                current: scopeList,
                instructions: 'Please create a new token with the required permissions at: https://github.com/settings/tokens/new'
            });
        }

        // Save token to user
        await User.findOneAndUpdate(
            { userId },
            { githubAccessToken: token }
        );

        return res.status(200).json({
            message: 'GitHub token saved successfully',
            github: {
                username: userData.login,
                name: userData.name,
                email: userData.email,
                scopes: scopeList,
                access: hasFullRepoAccess ? 'all repositories' : 'public repositories only'
            }
        });

    } catch (error) {
        console.error('Save GitHub token error:', error);
        return res.status(500).json({
            message: 'Failed to save GitHub token',
            error: error.message
        });
    }
};

/**
 * Get GitHub token status
 * GET /api/auth/github-token/status
 */
const getGitHubTokenStatus = async (req, res) => {
    try {
        const userId = req.user.userId; // From verifyToken middleware

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.githubAccessToken) {
            return res.status(200).json({
                hasToken: false,
                message: 'No GitHub token configured'
            });
        }

        // Validate the stored token
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${user.githubAccessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            // Token is invalid or expired
            // Optionally remove it
            await User.findOneAndUpdate(
                { userId },
                { githubAccessToken: null }
            );

            return res.status(200).json({
                hasToken: false,
                isValid: false,
                message: 'Stored GitHub token is invalid or expired. Please add a new token.'
            });
        }

        const userData = await response.json();
        const scopes = response.headers.get('x-oauth-scopes') || '';
        const scopeList = scopes.split(',').map(s => s.trim());

        const hasFullRepoAccess = scopeList.includes('repo');
        const hasPublicRepoAccess = scopeList.includes('public_repo');
        const hasWebhookAccess = scopeList.includes('admin:repo_hook') || scopeList.includes('write:repo_hook');

        return res.status(200).json({
            hasToken: true,
            isValid: true,
            github: {
                username: userData.login,
                name: userData.name,
                scopes: scopeList,
                access: hasFullRepoAccess ? 'all repositories' : (hasPublicRepoAccess && hasWebhookAccess ? 'public repositories only' : 'insufficient permissions')
            }
        });

    } catch (error) {
        console.error('Get GitHub token status error:', error);
        return res.status(500).json({
            message: 'Failed to get GitHub token status',
            error: error.message
        });
    }
};

/**
 * Remove GitHub token
 * DELETE /api/auth/github-token
 */
const removeGitHubToken = async (req, res) => {
    try {
        const userId = req.user.userId; // From verifyToken middleware

        await User.findOneAndUpdate(
            { userId },
            { githubAccessToken: null }
        );

        return res.status(200).json({
            message: 'GitHub token removed successfully'
        });

    } catch (error) {
        console.error('Remove GitHub token error:', error);
        return res.status(500).json({
            message: 'Failed to remove GitHub token',
            error: error.message
        });
    }
};

/**
 * Get current user information
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // From verifyToken middleware

        const user = await User.findOne({ userId }).select('-hashedPassword');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                githubAccessToken: user.githubAccessToken ? '***' : null,
                hasGithubToken: !!user.githubAccessToken,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            message: 'Failed to get user information',
            error: error.message
        });
    }
};

/**
 * Get GitHub repositories for authenticated user
 * GET /api/auth/github/repos
 */
const getGithubRepos = async (req, res) => {
    try {
        const userId = req.user.userId; // From verifyToken middleware

        const user = await User.findOne({ userId });
        if (!user || !user.githubAccessToken) {
            return res.status(400).json({
                message: 'GitHub account not connected. Please connect your GitHub account first.'
            });
        }

        // Fetch repositories from GitHub
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                'Authorization': `Bearer ${user.githubAccessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            // Token might be invalid
            if (response.status === 401) {
                return res.status(401).json({
                    message: 'GitHub token is invalid or expired. Please reconnect your GitHub account.'
                });
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const repos = await response.json();

        // Format repository data
        const formattedRepos = repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner.login,
            private: repo.private,
            description: repo.description,
            cloneUrl: repo.clone_url,
            htmlUrl: repo.html_url,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at,
            language: repo.language
        }));

        return res.status(200).json({
            repos: formattedRepos,
            count: formattedRepos.length
        });

    } catch (error) {
        console.error('Get GitHub repos error:', error);
        return res.status(500).json({
            message: 'Failed to fetch GitHub repositories',
            error: error.message
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    verifyUserRegistration,
    googleAuth,
    getPendingRegistrations,
    getOTPForEmail,
    initiateGitHubOAuth,
    handleGitHubCallback,
    saveGitHubToken,
    getGitHubTokenStatus,
    removeGitHubToken,
    getCurrentUser,
    getGithubRepos
};
