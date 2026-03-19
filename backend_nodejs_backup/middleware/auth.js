const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Check if user has selected a role
const requireRole = (req, res, next) => {
  if (!req.user.role) {
    return res.status(403).json({ 
      success: false, 
      message: 'Please select a role first',
      requiresRoleSelection: true
    });
  }
  next();
};

// Check if user is an owner
const requireOwner = (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only owners can perform this action.' 
    });
  }
  next();
};

// Check if user is a customer
const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only customers can perform this action.' 
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireOwner,
  requireCustomer
};
