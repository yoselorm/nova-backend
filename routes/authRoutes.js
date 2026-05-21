// --- routes/authRoutes.js ---
const express = require('express');
const authRouter = express.Router();
const { adminLogin, adminLogout } = require('../controllers/authController');

authRouter.post('/login', adminLogin);
authRouter.post('/logout', adminLogout);

module.exports = authRouter;