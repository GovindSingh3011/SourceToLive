const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role || "admin",
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    if(user.userId){
        payload.userId = user.userId;
    }

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {expiresIn: '1d'});
};

module.exports = generateToken;
