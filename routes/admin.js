const express = require('express');
const router = express.Router();
const { showLoginPage, handleLogin, logout } = require('../controllers/admin/authAdminController');
const { isAdmin } = require('../middleware/adminAuth');
const { userCreationRules, userUpdateRules } = require('../middleware/validators/userValidator');
const { 
    listUsers, 
    viewUser, 
    showCreateForm, 
    createUser, 
    showEditForm, 
    updateUser, 
    deleteUser 
} = require('../controllers/admin/userAdminController');
const { getUsersDataTable } = require('../controllers/admin/dataTable/userDataTable');

// Auth
router.get('/login', showLoginPage);
router.post('/login', handleLogin);
router.get('/logout', logout);

// Dashboard
router.get('/dashboard', isAdmin, (req, res) => res.render('admin/dashboard'));

// Users
router.get('/users', isAdmin, listUsers);
router.get('/users/create', isAdmin, showCreateForm);
router.post('/users/create', isAdmin, userCreationRules(), createUser);
router.get('/users/edit/:id', isAdmin, showEditForm);
router.get('/users/view/:id', isAdmin, viewUser);
router.post('/users/update/:id', isAdmin, userUpdateRules(), updateUser);
router.post('/users/delete/:id', isAdmin, deleteUser);

// DataTable API endpoint
// router.get('/api/users-datatable', getUsersDataTable);
router.get('/api/users-datatable', isAdmin, getUsersDataTable);
console.log('DataTable endpoint for users initialized');

module.exports = router;
