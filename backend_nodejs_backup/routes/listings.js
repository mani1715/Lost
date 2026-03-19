const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole, requireOwner } = require('../middleware/auth');
const Listing = require('../models/Listing');
const User = require('../models/User');

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private (Owner only)
router.post(
  '/',
  [
    authMiddleware,
    requireRole,
    requireOwner,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['room', 'house', 'lodge', 'pg', 'hostel', 'apartment', 'villa', 'cottage', 'farmhouse', 'studio']).withMessage('Invalid property type'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('squareFeet').isNumeric().withMessage('Square feet must be a number'),
    body('addressText').trim().notEmpty().withMessage('Address is required')
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

      const listingData = {
        ...req.body,
        ownerId: req.user._id
      };

      const listing = new Listing(listingData);
      await listing.save();

      // Populate owner info
      await listing.populate('ownerId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        listing
      });
    } catch (error) {
      console.error('Create listing error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   GET /api/listings
// @desc    Get all listings with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, location, search, ownerId } = req.query;
    
    let query = {};

    // Build query based on filters
    if (type) query.type = type;
    if (ownerId) query.ownerId = ownerId;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (location) {
      query.addressText = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { addressText: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/listings/:id
// @desc    Get a single listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('ownerId', 'name email');

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private (Owner only - own listings)
router.put('/:id', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    // Check if user owns the listing
    if (listing.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this listing' 
      });
    }

    // Update listing
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email');

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (Owner only - own listings)
router.delete('/:id', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    // Check if user owns the listing
    if (listing.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this listing' 
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
