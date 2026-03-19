const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/me
// @desc    Get current user info
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      },
      requiresRoleSelection: !req.user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/user/select-role
// @desc    Select user role (one-time only)
// @access  Private
router.post(
  '/select-role',
  [
    authMiddleware,
    body('role').isIn(['OWNER', 'CUSTOMER']).withMessage('Role must be either OWNER or CUSTOMER')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Check if role is already set
      if (req.user.role) {
        return res.status(400).json({ 
          success: false, 
          message: 'Role has already been set and cannot be changed' 
        });
      }

      const { role } = req.body;

      // Update user role
      req.user.role = role;
      await req.user.save();

      res.json({
        success: true,
        message: 'Role selected successfully',
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error('Select role error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

module.exports = router;
