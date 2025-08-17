const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/api/authApiController');
const { protect } = require('../middleware/apiAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
