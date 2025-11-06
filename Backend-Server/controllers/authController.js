const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const transporter = require('../utils/emailTransporter');
const { OAuth2Client } = require('google-auth-library');

const generateUserId = async () => {
    let lastUser = await User.findOne().sort({userId : -1});
    return  lastUser ? lastUser.userId + 1 : 1000; // userId starts with 1000
};

// In-memory store for pending registration
// Key: email, Value: {userData, OTP, expiresAt}
const pendingRegistrations = new Map();

// Public registration - anyone can register
const registerUser = async (req, res) => {
    try{
        console.log('📝 Registration request received:', req.body);
        const {firstName, lastName, email} = req.body;
        
        if(!firstName || !lastName || !email){
            return res.status(400).json({message: "All fields are required"});
        }
        
        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message: "User with this email already exists"});
        }
        
        if(pendingRegistrations.has(email)){
            return res.status(429).json({message: "Registration already initiated. Please verify OTP sent to email."});
        }
        
        // Generate unique user ID automatically
        const userId = await generateUserId();
        const otp = generateOTP();
        const expiresAt = Date.now() + 3*60*1000;
        
        pendingRegistrations.set(email, {
            userData: {firstName, lastName, email, userId},
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
    }catch(error){
        console.error("Error initiating user registration: ", error);
        return res.status(500).json({message: "Server Error"});
    }
}

const verifyUserRegistration = async (req, res) => {
    try{
        const {email, otp, password} = req.body;
        
        if(!email || !otp || !password){
            return res.status(400).json({message: "Email, OTP, and password are required"});
        }
        
        const pending = pendingRegistrations.get(email);
        if(!pending){
            return res.status(400).json({message: "No pending registration found for this email. Please initiate registration again."});
        }
        
        if(Date.now() > pending.expiresAt){
            pendingRegistrations.delete(email);
            return res.status(410).json({message: "OTP expired. Please initiate registration again."});
        }
        
        if(otp !== pending.otp){
            return res.status(401).json({message: "Invalid OTP. Please try again."});
        }
        
        const {firstName, lastName, userId} = pending.userData;
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
    }catch(error){
        console.error("Error verifying OTP and registering user: ", error);
        return res.status(500).json({message: 'Server Error'});
    }
}

// Login with email and password
const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid credentials"});
        }
        
        if(user.isActive === false){
            return res.status(403).json({message: "Your account has been deactivated"});
        }
        
        // Check if user registered with Google
        if(user.authProvider === 'google'){
            return res.status(400).json({message: "This account uses Google login. Please sign in with Google."});
        }
        
        if(!user.hashedPassword){
            return res.status(400).json({message: "Password not set for this account"});
        }
        
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if(!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
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
    }catch(error){
        console.error("Login Error: ", error);
        return res.status(500).json({message: "Server Error"});
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

module.exports = {
    loginUser,
    registerUser,
    verifyUserRegistration,
    googleAuth,
    getPendingRegistrations,
    getOTPForEmail
};
