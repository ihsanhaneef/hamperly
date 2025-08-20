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
 // Add this import
// const { 
//     listCategories, 
//     viewCategory, 
//     showCreateForm: showCategoryCreateForm, 
//     createCategory, 
//     showEditForm: showCategoryEditForm, 
//     updateCategory, 
//     deleteCategory,
//     toggleStatus ,
//     getCategoriesDataTable
// } = require('../controllers/admin/categoryController'); // Update this import
const categoryController = require('../controllers/admin/categoryController');
const UserController = require('../controllers/admin/userAdminController');

// Auth
router.get('/login', showLoginPage);
router.post('/login', handleLogin);
router.get('/logout', logout);

// Dashboard
router.get('/dashboard', isAdmin, (req, res) => res.render('admin/dashboard'));

// Users
router.get('/users', UserController.listUsers);
router.get('/users/create', UserController.showCreateForm);
router.post('/users/create', UserController.createUser);
router.get('/users/view/:id', UserController.viewUser);
router.get('/users/edit/:id', UserController.showEditForm);
router.post('/users/edit/:id', UserController.updateUser);
router.post('/users/delete/:id', UserController.deleteUser);
router.post('/users/toggle-role/:id', UserController.toggleRole);
router.get('/api/users-datatable', UserController.getUsersDataTable);

// Categories
router.get('/categories', isAdmin, categoryController.listCategories);
router.get('/categories/create', isAdmin, categoryController.showCreateForm);
router.post('/categories/create', isAdmin, categoryController.createCategory);
router.get('/categories/edit/:id', isAdmin, categoryController.showEditForm);
router.get('/categories/view/:id', isAdmin, categoryController.viewCategory);
router.post('/categories/update/:id', isAdmin, categoryController.updateCategory);
router.post('/categories/delete/:id', isAdmin, categoryController.deleteCategory);
router.post('/categories/toggle/:id', isAdmin, categoryController.toggleStatus);
router.get('/api/categories-datatable', isAdmin, categoryController.getCategoriesDataTable);

module.exports = router;
