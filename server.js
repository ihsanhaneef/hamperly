// Server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const expressEjsLayouts = require('express-ejs-layouts');
const path = require('path');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const { getFieldError } = require('./helpers/errorHelper');
const { Server } = require('http');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine Setup (EJS) with Layouts ---
app.use(expressEjsLayouts);
app.set('layout', './layouts/adminLayout'); // Default layout
app.set("layout extractScripts", true); // <-- This is the key fix
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.getFieldError = getFieldError;


// Routes
app.get('/', (req, res) => {
    res.send('API and Admin Panel are running.');
});

app.use('/api/v1', apiRoutes);
app.use('/admin', adminRoutes);

// 404 Handler (optional but good practice)
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
