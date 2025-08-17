const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../helpers/responseHelper');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return error(res, 'No user found with this id', 401);
            }
            next();
        } catch (err) {
            logger.error(`API Auth Error: ${err.message}`);
            return error(res, 'Not authorized, token failed', 401);
        }
    }

    if (!token) {
        return error(res, 'Not authorized, no token', 401);
    }
};

module.exports = { protect };
