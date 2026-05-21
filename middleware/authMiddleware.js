const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  // 1. Look for the token in the HTTP Authorization header matrix
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the "Bearer" string away from the token parameter payload
      token = req.headers.authorization.split(' ')[1];
    } catch (err) {
      return res.status(401).json({ message: 'Malformed authorization header structure.' });
    }
  }

  // 2. Reject request if no authorization token log is present
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No operational token logs found.' });
  }

  try {
    // Decrypt and validate token payload structure using server secret signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach admin context back to operational route thread (excluding passcode hash)
    req.admin = await Admin.findById(decoded.id).select('-password');
    
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized system profile signature.' });
    }

    next(); // Advance execution matrix forward to controller logic
  } catch (error) {
    return res.status(401).json({ message: 'Session validation token expired or corrupt.' });
  }
};

module.exports = { protectAdmin };