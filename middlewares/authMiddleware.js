const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this matches the key you used for signing

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    // Extract token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access token missing or invalid' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user; // Attach decoded user data to request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
