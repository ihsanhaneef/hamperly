const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

const userCreationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.'),
        body('username').notEmpty().withMessage('Username is required.')
            .custom(async (value) => {
                const user = await User.findOne({ username: value.toLowerCase() });
                if (user) {
                    return Promise.reject('Username already in use.');
                }
            }),
        body('email').isEmail().withMessage('Must be a valid email.')
            .custom(async (value) => {
                const user = await User.findOne({ email: value.toLowerCase() });
                if (user) {
                    return Promise.reject('E-mail already in use.');
                }
            }),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('is_admin').isIn(['1', '2']).withMessage('Role is invalid.'),
    ];
};

const userUpdateRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Must be a valid email.')
             .custom(async (value, { req }) => {
                const user = await User.findOne({ email: value.toLowerCase() });
                if (user && user._id.toString() !== req.params.id) {
                     return Promise.reject('E-mail already in use by another user.');
                }
            }),
        body('is_admin').isIn(['1', '2']).withMessage('Role is invalid.'),
        body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    // For Admin Panel: Re-render form with errors
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    const backURL = req.header('Referer') || '/';
    
    // Store errors and old input in a way that redirect can access
    // This requires session or flash messages. For simplicity here, we'll just log and redirect.
    // A better implementation would use `connect-flash`.
    // For this project, we'll handle re-rendering in the controller itself.
    return next(); // Pass to the controller to handle rendering
};


module.exports = {
    userCreationRules,
    userUpdateRules,
    validate,
};
