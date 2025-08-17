const User = require('../../models/User');
const { validationResult } = require('express-validator');
const logger = require('../../config/logger');
const bcrypt = require('bcryptjs');

const listUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.render('admin/users/index', { users });
    } catch (err) {
        logger.error(`Admin List Users Error: ${err.message}`);
        res.redirect('/admin/dashboard');
    }
};

const showCreateForm = (req, res) => {
    res.render('admin/users/create', { errors: [], oldInput: {} });
};

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('admin/users/create', {
            errors: errors.array(),
            oldInput: req.body
        });
    }

    try {
        const { name, username, email, password, is_admin } = req.body;
        await User.create({ name, username, email, password, is_admin });
        logger.info(`Admin created new user: ${username}`);
        res.redirect('/admin/users');
    } catch (err) {
        logger.error(`Admin Create User Error: ${err.message}`);
        res.status(500).render('admin/users/create', {
            errors: [{ msg: 'Server error, could not create user.' }],
            oldInput: req.body
        });
    }
};

const showEditForm = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/admin/users');
        }
        res.render('admin/users/edit', { user, errors: [], oldInput: {} });
    } catch (err) {
        logger.error(`Admin Show Edit Form Error: ${err.message}`);
        res.redirect('/admin/users');
    }
};

const viewUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/admin/users');
        }
        res.render('admin/users/view', { user });
    } catch (err) {
        logger.error(`Admin View User Error: ${err.message}`);
        res.redirect('/admin/users');
    }
};

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    const userToEdit = await User.findById(req.params.id);

    if (!errors.isEmpty()) {
        return res.status(400).render('admin/users/edit', {
            errors: errors.array(),
            user: userToEdit, // Pass existing user data back to the form
            oldInput: req.body
        });
    }

    try {
        const { name, email, is_admin, password } = req.body;
        const updateData = { name, email, is_admin };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await User.findByIdAndUpdate(req.params.id, updateData);
        logger.info(`Admin updated user ID: ${req.params.id}`);
        res.redirect('/admin/users');
    } catch (err) {
        logger.error(`Admin Update User Error: ${err.message}`);
        res.status(500).render('admin/users/edit', {
            errors: [{ msg: 'Server error, could not update user.' }],
            user: userToEdit,
            oldInput: req.body
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        logger.info(`Admin deleted user ID: ${req.params.id}`);
        res.redirect('/admin/users');
    } catch (err) {
        logger.error(`Admin Delete User Error: ${err.message}`);
        res.redirect('/admin/users');
    }
};

module.exports = { listUsers, showCreateForm, createUser, showEditForm, updateUser, deleteUser , viewUser };
