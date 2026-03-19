const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const { authMiddleware, requireRole, requireCustomer } = require('../middleware/auth');

// Add to wishlist
router.post('/:propertyId', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    // Check if property exists
    const property = await Listing.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: userId, property: propertyId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property already in wishlist'
      });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: userId,
      property: propertyId
    });

    await wishlistItem.save();

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
});

// Remove from wishlist
router.delete('/:propertyId', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: userId,
      property: propertyId
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Property not in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

// Get user's wishlist
router.get('/', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: 'property',
        populate: {
          path: 'ownerId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out items with deleted properties
    const validWishlist = wishlistItems.filter(item => item.property !== null);

    res.json({
      success: true,
      data: validWishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
});

module.exports = router;
