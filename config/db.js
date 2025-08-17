const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        logger.info('MongoDB Connected successfully.');
    } catch (err) {
        logger.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
