// controllers/admin/userController.js
const User = require("../../models/User");
const { validationResult } = require("express-validator");
const {
  userCreationRules,
  userUpdateRules,
} = require("../../middleware/validators/userValidator");
const logger = require("../../config/logger");
const UserDataTable = require("./dataTable/userDataTable");

const getUsersDataTable = async (req, res) => {
  try {
    const dataTable = new UserDataTable(User, req);
    const result = await dataTable.processRequest();
    res.json(result);
  } catch (err) {
    logger.error(`DataTable Users Error: ${err.message}`);
    
    res.status(500).json({
      draw: req.query.draw || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: err.message
    });
  }
};

// List Users
const listUsers = async (req, res) => {
  try {
    logger.info("Admin listing users");
    
    const success = req.flash('success');
    const error = req.flash('error');
    
    res.render("admin/users/index", {
      title: 'Users Management',
      success: success.length > 0 ? success[0] : null,
      error: error.length > 0 ? error : null
    });
  } catch (err) {
    logger.error(`Admin List Users Error: ${err.message}`);
    req.flash('error', 'Error loading users page');
    res.redirect("/admin/dashboard");
  }
};

// Show Create Form
const showCreateForm = (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');
  
  res.render("admin/users/create", {
    title: 'Create New User',
    errors: [],
    oldInput: {},
    success: success.length > 0 ? success[0] : null,
    error: error.length > 0 ? error : null
  });
};

// Create User
const createUser = async (req, res) => {
  const rules = userCreationRules();
  await Promise.all(rules.map((validator) => validator.run(req)));
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("admin/users/create", {
      title: 'Create New User',
      errors: errors.array(),
      oldInput: req.body,
      success: null,
      error: null
    });
  }

  try {
    const { name, username, email, password, is_admin } = req.body;
    const userData = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password,
      is_admin: parseInt(is_admin) || 2,
    };

    await User.create(userData);
    logger.info(`Admin created new user: ${username}`);

    req.flash('success', 'User created successfully!');
    res.redirect('/admin/users');
    
  } catch (err) {
    logger.error(`Admin Create User Error: ${err.message}`);

    let errorMessage = "Server error, could not create user.";
    if (err.code === 11000) {
      if (err.keyPattern.username) {
        errorMessage = "Username already exists.";
      } else if (err.keyPattern.email) {
        errorMessage = "Email already exists.";
      }
    }

    res.status(500).render("admin/users/create", {
      title: 'Create New User',
      errors: [{ msg: errorMessage }],
      oldInput: req.body,
      success: null,
      error: null
    });
  }
};

// Show Edit Form
const showEditForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      logger.warn(`User not found for edit: ${req.params.id}`);
      req.flash('error', 'User not found');
      return res.redirect("/admin/users");
    }
    
    const success = req.flash('success');
    const error = req.flash('error');
    
    res.render("admin/users/edit", {
      title: 'Edit User',
      user,
      errors: [],
      oldInput: {},
      success: success.length > 0 ? success[0] : null,
      error: error.length > 0 ? error : null
    });
  } catch (err) {
    logger.error(`Admin Show Edit User Form Error: ${err.message}`);
    req.flash('error', 'Error loading user for editing');
    res.redirect("/admin/users");
  }
};

// View User
const viewUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      logger.warn(`User not found for view: ${req.params.id}`);
      req.flash('error', 'User not found');
      return res.redirect("/admin/users");
    }
    res.render("admin/users/view", { 
      title: 'User Details',
      user 
    });
  } catch (err) {
    logger.error(`Admin View User Error: ${err.message}`);
    req.flash('error', 'Error loading user details');
    res.redirect("/admin/users");
  }
};

// Update User
// Update User
const updateUser = async (req, res) => {
  let userToEdit;
  try {
    userToEdit = await User.findById(req.params.id);
    if (!userToEdit) {
      req.flash('error', 'User not found');
      return res.redirect("/admin/users");
    }
  } catch (err) {
    logger.error(`Admin Fetch User for Update Error: ${err.message}`);
    req.flash('error', 'Error fetching user for update');
    return res.redirect("/admin/users");
  }

  const rules = userUpdateRules();
  await Promise.all(rules.map((validator) => validator.run(req)));
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("admin/users/edit", {
      title: 'Edit User',
      errors: errors.array(),
      user: userToEdit,
      oldInput: req.body,
      success: null,
      error: null
    });
  }

  try {
    const { name, username, email, is_admin } = req.body;
    
    const updateData = {
      name: name ? name.trim() : userToEdit.name, // Use existing name if new one is empty
      username: username ? username.trim().toLowerCase() : userToEdit.username,
      email: email ? email.trim().toLowerCase() : userToEdit.email,
      is_admin: is_admin ? parseInt(is_admin) : userToEdit.is_admin,
    };

    // Only update password if provided
    if (req.body.password && req.body.password.trim()) {
      updateData.password = req.body.password.trim();
    }

    // ✅ Add logging to debug what data we're receiving
    console.log('Update data received:', {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      is_admin: req.body.is_admin
    });

    await User.findByIdAndUpdate(req.params.id, updateData);
    logger.info(`Admin updated user ID: ${req.params.id}`);

    req.flash('success', 'User updated successfully!');
    res.redirect('/admin/users');
    
  } catch (err) {
    logger.error(`Admin Update User Error: ${err.message}`);

    let errorMessage = "Server error, could not update user.";
    if (err.code === 11000) {
      if (err.keyPattern.username) {
        errorMessage = "Username already exists.";
      } else if (err.keyPattern.email) {
        errorMessage = "Email already exists.";
      }
    }

    res.status(500).render("admin/users/edit", {
      title: 'Edit User',
      errors: [{ msg: errorMessage }],
      user: userToEdit,
      oldInput: req.body,
      success: null,
      error: null
    });
  }
};


// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn(`User not found for deletion: ${req.params.id}`);
      req.flash('error', 'User not found');
      return res.redirect("/admin/users");
    }

    await User.findByIdAndDelete(req.params.id);
    logger.info(`Admin deleted user ID: ${req.params.id}`);
    
    req.flash('success', 'User deleted successfully!');
    res.redirect("/admin/users");
  } catch (err) {
    logger.error(`Admin Delete User Error: ${err.message}`);
    req.flash('error', 'Error deleting user');
    res.redirect("/admin/users");
  }
};

// Toggle Role (Admin/User)
const toggleRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Toggle between Admin (1) and User (2)
    user.is_admin = user.is_admin === 1 ? 2 : 1;
    await user.save();

    const newRole = user.is_admin === 1 ? 'Admin' : 'User';
    logger.info(`Admin toggled user role ID: ${req.params.id} to ${newRole}`);
    
    res.json({
      success: true,
      message: `User role changed to ${newRole} successfully`,
      newRole: user.is_admin,
    });
  } catch (err) {
    logger.error(`Admin Toggle User Role Error: ${err.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  listUsers,
  showCreateForm,
  createUser,
  showEditForm,
  updateUser,
  deleteUser,
  viewUser,
  toggleRole,
  getUsersDataTable
};
