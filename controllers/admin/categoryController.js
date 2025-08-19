// controllers/admin/categoryController.js (updated to call validation rules from separate file)
const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { categoryCreationRules, categoryUpdateRules } = require('../../middleware/validators/categoryValidator'); // Import rules
const logger = require('../../config/logger');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads (no fileFilter or limits here; handled in validation)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/categories');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// List Categories - For DataTables
const listCategories = async (req, res) => {
    try {
        logger.info('Admin listing categories');
        res.render('admin/categories/index');
    } catch (err) {
        logger.error(`Admin List Categories Error: ${err.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Show Create Form
const showCreateForm = (req, res) => {
    res.render('admin/categories/create', { 
        errors: [], 
        oldInput: {},
        success: null 
    });
};

// Create Category
const createCategory = async (req, res) => {
    const rules = categoryCreationRules();
    await Promise.all(rules.map(validator => validator.run(req)));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        return res.status(400).render('admin/categories/create', {
            errors: errors.array(),
            oldInput: req.body,
            success: null
        });
    }

    try {
        const { name, description, isActive } = req.body;
        const categoryData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            isActive: isActive === 'true' || isActive === true
        };

        // Handle image upload
        if (req.file) {
            categoryData.image = req.file.filename;
        }

        await Category.create(categoryData);
        logger.info(`Admin created new category: ${name}`);
        
        res.render('admin/categories/create', {
            errors: [],
            oldInput: {},
            success: 'Category created successfully!'
        });
    } catch (err) {
        logger.error(`Admin Create Category Error: ${err.message}`);
        
        // If there was an uploaded file and creation failed, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        let errorMessage = 'Server error, could not create category.';
        if (err.code === 11000) {
            errorMessage = 'Category name already exists.';
        }

        res.status(500).render('admin/categories/create', {
            errors: [{ msg: errorMessage }],
            oldInput: req.body,
            success: null
        });
    }
};

// Show Edit Form
const showEditForm = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            logger.warn(`Category not found for edit: ${req.params.id}`);
            return res.redirect('/admin/categories');
        }
        res.render('admin/categories/edit', { 
            category, 
            errors: [], 
            oldInput: {},
            success: null 
        });
    } catch (err) {
        logger.error(`Admin Show Edit Category Form Error: ${err.message}`);
        res.redirect('/admin/categories');
    }
};

// View Category
const viewCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            logger.warn(`Category not found for view: ${req.params.id}`);
            return res.redirect('/admin/categories');
        }
        res.render('admin/categories/view', { category });
    } catch (err) {
        logger.error(`Admin View Category Error: ${err.message}`);
        res.redirect('/admin/categories');
    }
};

// Update Category
const updateCategory = async (req, res) => {
    // Fetch category first
    let categoryToEdit;
    try {
        categoryToEdit = await Category.findById(req.params.id);
        if (!categoryToEdit) {
            // Delete uploaded file if any
            if (req.file) {
                const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.redirect('/admin/categories');
        }
    } catch (err) {
        logger.error(`Admin Fetch Category for Update Error: ${err.message}`);
        // Delete uploaded file if any
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        return res.redirect('/admin/categories');
    }

    // Get and run validation rules from separate file
    const rules = categoryUpdateRules();
    await Promise.all(rules.map(validator => validator.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Delete uploaded file if validation fails
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        return res.status(400).render('admin/categories/edit', {
            errors: errors.array(),
            category: categoryToEdit,
            oldInput: req.body,
            success: null
        });
    }

    try {
        const { name, description, isActive } = req.body;
        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            isActive: isActive === 'true' || isActive === true,
            updatedAt: Date.now()
        };

        let oldImagePath = null;

        // Handle image upload
        if (req.file) {
            // Store old image path for deletion
            if (categoryToEdit.image && categoryToEdit.image !== 'default-category.jpg') {
                oldImagePath = path.join(__dirname, '../../public/uploads/categories', categoryToEdit.image);
            }
            updateData.image = req.file.filename;
        }

        await Category.findByIdAndUpdate(req.params.id, updateData);

        // Delete old image if new one was uploaded
        if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }

        logger.info(`Admin updated category ID: ${req.params.id}`);
        
        const updatedCategory = await Category.findById(req.params.id);
        res.render('admin/categories/edit', {
            category: updatedCategory,
            errors: [],
            oldInput: {},
            success: 'Category updated successfully!'
        });
    } catch (err) {
        logger.error(`Admin Update Category Error: ${err.message}`);
        
        // If there was an uploaded file and update failed, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads/categories', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        let errorMessage = 'Server error, could not update category.';
        if (err.code === 11000) {
            errorMessage = 'Category name already exists.';
        }

        res.status(500).render('admin/categories/edit', {
            errors: [{ msg: errorMessage }],
            category: categoryToEdit,
            oldInput: req.body,
            success: null
        });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            logger.warn(`Category not found for deletion: ${req.params.id}`);
            return res.redirect('/admin/categories');
        }

        // Delete associated image file
        if (category.image && category.image !== 'default-category.jpg') {
            const imagePath = path.join(__dirname, '../../public/uploads/categories', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Category.findByIdAndDelete(req.params.id);
        logger.info(`Admin deleted category ID: ${req.params.id}`);
        res.redirect('/admin/categories');
    } catch (err) {
        logger.error(`Admin Delete Category Error: ${err.message}`);
        res.redirect('/admin/categories');
    }
};

// Toggle Status
const toggleStatus = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.isActive = !category.isActive;
        category.updatedAt = Date.now();
        await category.save();

        logger.info(`Admin toggled category status ID: ${req.params.id} to ${category.isActive}`);
        res.json({ 
            success: true, 
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            newStatus: category.isActive 
        });
    } catch (err) {
        logger.error(`Admin Toggle Category Status Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { 
    listCategories, 
    showCreateForm, 
    createCategory: [upload.single('image'), createCategory],
    showEditForm, 
    updateCategory: [upload.single('image'), updateCategory], 
    deleteCategory, 
    viewCategory,
    toggleStatus
};
