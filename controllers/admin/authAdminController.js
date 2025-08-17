const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const logger = require('../../config/logger');

const showLoginPage = (req, res) => {
    res.render('admin/auth/login', { layout: false, error: null }); // Don't use main layout for login page
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.is_admin !== 1) {
            logger.warn(`Admin login attempt failed for email: ${email} (not an admin)`);
            return res.render('admin/auth/login', { layout: false, error: 'Invalid credentials or not an admin.' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn(`Admin login attempt failed for email: ${email} (wrong password)`);
            return res.render('admin/auth/login', { layout: false, error: 'Invalid credentials or not an admin.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.ADMIN_COOKIE_SECRET, { expiresIn: '1d' });
        
        res.cookie(process.env.ADMIN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        logger.info(`Admin user ${user.username} logged in successfully.`);
        res.redirect('/admin/dashboard');

    } catch (err) {
        logger.error(`Admin Login Error: ${err.message}`);
        res.render('admin/auth/login', { layout: false, error: 'An error occurred. Please try again.' });
    }
};

const logout = (req, res) => {
    res.clearCookie(process.env.ADMIN_COOKIE_NAME);
    res.redirect('/admin/login');
};

module.exports = { showLoginPage, handleLogin, logout };
