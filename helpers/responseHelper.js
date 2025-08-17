const logger = require('../config/logger');

const success = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const error = (res, message, statusCode = 500) => {
    logger.error(`Error Response: ${statusCode} - ${message}`);
    res.status(statusCode).json({
        success: false,
        message,
        data: {},
    });
};

module.exports = { success, error };
