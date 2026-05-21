const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Helper Function: Signs JWT payload data matrix
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token cluster becomes void after 24 operational hours
  });
};

// @desc    Authenticate credentials and return secure tracking cookie
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

    // Construct highly-secure HTTP-Only cookie response vector
    res.cookie('admin_token', token, {
      httpOnly: true, // Safeguards against cross-site scripting script hooks
      secure: process.env.NODE_ENV === 'production', // Forces SSL encryption protocol in prod
      sameSite: 'strict', // Mitigates Cross-Site Request Forgery tracking vulnerabilities
      maxAge: 24 * 60 * 60 * 1000 // Invalidate cookie layer sync cleanly in 1 day
    });

    res.status(200).json({
      success: true,
      admin: { id: admin._id, email: admin.email, role: admin.role, createdAt: admin.createdAt ,updatedAt: admin.updatedAt},
        message: 'Authentication successful. Secure session cookie issued.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Auth Pipeline Crash', error: error.message });
  }
};

// @desc    Flush secure cookie session registry to terminate connection
// @route   POST /api/auth/logout
const adminLogout = async (req, res) => {
  res.cookie('admin_token', '', {
    httpOnly: true,
    expires: new Date(0) // Instantly flush cookie timeline signature
  });
  res.status(200).json({ success: true, message: 'Terminal connection broken cleanly.' });
};

module.exports = { adminLogin, adminLogout };