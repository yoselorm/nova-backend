const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  // Extract the token parameter straight out of the secure cookie storage layer
  if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No operational token logs found.' });
  }

  try {
    // Decrypt and validate token payload structure
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