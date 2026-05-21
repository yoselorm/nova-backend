const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Helper Function: Signs JWT payload data matrix
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token cluster becomes void after 24 operational hours
  });
};

// @desc    Authenticate credentials and return token in response payload
// @route   POST /api/auth/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all authentication parameters.' });
    }

    // Trace existing profile log
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid operational credential arrays.' });
    }

    const token = generateToken(admin._id);

    // Instead of attaching a cookie, pass the token directly to the body payload
    res.status(200).json({
      success: true,
      token, // Frontend will grab this and drop it in sessionStorage
      admin: { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role, 
        createdAt: admin.createdAt, 
        updatedAt: admin.updatedAt
      },
      message: 'Authentication successful. Token issued.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Auth Pipeline Crash', error: error.message });
  }
};

// @desc    Logout handles clearing local context (No operation needed on server side for stateless JWTs)
// @route   POST /api/auth/logout
const adminLogout = async (req, res) => {
  // Stateless JWTs with sessionStorage are destroyed by dropping them on the frontend.
  res.status(200).json({ 
    success: true, 
    message: 'Server session closed. Clear sessionStorage on your frontend instance.' 
  });
};

module.exports = { adminLogin, adminLogout };