// routes/admin.js

const express = require('express');
const router = express.Router();
const { showLoginPage, handleLogin, logout } = require('../controllers/admin/authAdminController');
const { isAdmin } = require('../middleware/adminAuth');
const { userCreationRules, userUpdateRules } = require('../middleware/validators/userValidator');

// Correctly import ALL necessary functions from the user controller
const { 
    listUsers, 
    viewUser, 
    showCreateForm, 
    createUser, 
    showEditForm, 
    updateUser, 
    deleteUser 
} = require('../controllers/admin/userAdminController');

// Auth
router.get('/login', showLoginPage);
router.post('/login', handleLogin);
router.get('/logout', logout);

// Dashboard
router.get('/dashboard', isAdmin, (req, res) => res.render('admin/dashboard'));

// --- USER MANAGEMENT ROUTES (THE FIX IS HERE) ---

// 1. This route RENDERS THE HTML PAGE when you visit /admin/users
// It MUST point to listUsers.
router.get('/users', isAdmin, listUsers);

// 2. This route PROVIDES THE JSON DATA for the datatable.
// It is called in the background by the JavaScript.
// router.post('/users/data', isAdmin, getUsersAsDataTable);

// --- The rest of your routes remain the same ---
router.get('/users/create', isAdmin, showCreateForm);
router.post('/users/create', isAdmin, userCreationRules(), createUser);
router.get('/users/edit/:id', isAdmin, showEditForm);
router.get('/users/view/:id', isAdmin, viewUser); // Assuming this is for viewing user details
router.post('/users/update/:id', isAdmin, userUpdateRules(), updateUser);
router.post('/users/delete/:id', isAdmin, deleteUser);

module.exports = router;
