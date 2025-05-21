const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key';

const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '30d', 
    });
};

const authentication = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { generateToken, authentication };