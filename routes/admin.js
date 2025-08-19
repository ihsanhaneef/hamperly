const express = require('express');
const router = express.Router();
const { showLoginPage, handleLogin, logout } = require('../controllers/admin/authAdminController');
const { isAdmin } = require('../middleware/adminAuth');
const { userCreationRules, userUpdateRules } = require('../middleware/validators/userValidator');
const { categoryCreationRules, categoryUpdateRules } = require('../middleware/validators/categoryValidator'); // Add this import
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
const { getCategoriesDataTable } = require('../controllers/admin/dataTable/categoryDataTable'); // Add this import
const { 
    listCategories, 
    viewCategory, 
    showCreateForm: showCategoryCreateForm, 
    createCategory, 
    showEditForm: showCategoryEditForm, 
    updateCategory, 
    deleteCategory,
    toggleStatus 
} = require('../controllers/admin/categoryController'); // Update this import
const categoryController = require('../controllers/admin/categoryController');

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
router.get('/api/users-datatable', isAdmin, getUsersDataTable);

// Categories
router.get('/categories', isAdmin, listCategories);
router.get('/categories/create', isAdmin, categoryController.showCreateForm);
router.post('/categories/create', isAdmin, categoryController.createCategory);
router.get('/categories/edit/:id', isAdmin, categoryController.showEditForm);
router.get('/categories/view/:id', isAdmin, categoryController.viewCategory);
router.post('/categories/update/:id', isAdmin, categoryController.updateCategory);
router.post('/categories/delete/:id', isAdmin, categoryController.deleteCategory);
router.post('/categories/toggle/:id', isAdmin, toggleStatus);
router.get('/api/categories-datatable', isAdmin, getCategoriesDataTable);

module.exports = router;
