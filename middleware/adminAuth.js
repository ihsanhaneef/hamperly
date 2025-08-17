const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const isAdmin = async (req, res, next) => {
    const token = req.cookies[process.env.ADMIN_COOKIE_NAME];
    
    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_COOKIE_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.is_admin !== 1) {
            logger.warn(`Admin auth failed: User ${user?.username} is not an admin.`);
            return res.redirect('/admin/login');
        }

        res.locals.user = user; // Make user info available in all EJS templates
        next();
    } catch (err) {
        logger.error(`Admin Auth Error: ${err.message}`);
        return res.redirect('/admin/login');
    }
};

module.exports = { isAdmin };
