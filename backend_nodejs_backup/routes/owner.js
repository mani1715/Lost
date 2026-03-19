const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole, requireOwner } = require('../middleware/auth');
const OwnerProfile = require('../models/OwnerProfile');

// @route   POST /api/owner/profile
// @desc    Create or update owner profile
// @access  Private (Owner only)
router.post(
  '/profile',
  [
    authMiddleware,
    requireRole,
    requireOwner,
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
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

      const { contactNumber, description } = req.body;

      // Check if profile already exists
      let profile = await OwnerProfile.findOne({ userId: req.user._id });

      if (profile) {
        // Update existing profile
        profile.contactNumber = contactNumber;
        if (description !== undefined) profile.description = description;
        await profile.save();

        return res.json({
          success: true,
          message: 'Profile updated successfully',
          profile: {
            id: profile._id,
            userId: profile.userId,
            contactNumber: profile.contactNumber,
            description: profile.description,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          }
        });
      }

      // Create new profile
      profile = new OwnerProfile({
        userId: req.user._id,
        contactNumber,
        description: description || ''
      });

      await profile.save();

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile: {
          id: profile._id,
          userId: profile.userId,
          contactNumber: profile.contactNumber,
          description: profile.description,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      });
    } catch (error) {
      console.error('Owner profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   GET /api/owner/profile
// @desc    Get owner profile
// @access  Private (Owner only)
router.get('/profile', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    const profile = await OwnerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    res.json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
        contactNumber: profile.contactNumber,
        description: profile.description,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get owner profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
