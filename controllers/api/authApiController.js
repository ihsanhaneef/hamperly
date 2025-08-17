const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { success, error } = require('../../helpers/responseHelper');
const logger = require('../../config/logger');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register a new user
// @route   POST /api/v1/register
// @access  Public
const register = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return error(res, 'Please add all fields', 400);
    }

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return error(res, 'User already exists', 400);
        }

        const user = await User.create({ name, username, email, password });

        if (user) {
            const token = generateToken(user._id);
            const userData = {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                token: token
            };
            return success(res, 'User registered successfully', userData, 201);
        } else {
            return error(res, 'Invalid user data');
        }
    } catch (err) {
        logger.error(`API Register Error: ${err.message}`);
        return error(res, 'Server Error');
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            const userData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token
            };
            return success(res, 'Login successful', userData);
        } else {
            return error(res, 'Invalid credentials', 401);
        }
    } catch (err) {
        logger.error(`API Login Error: ${err.message}`);
        return error(res, 'Server Error');
    }
};

// @desc    Get user data
// @route   GET /api/v1/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by the protect middleware
    return success(res, 'User data fetched', req.user);
};

module.exports = { register, login, getMe };
