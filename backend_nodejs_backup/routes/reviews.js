const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole, requireCustomer } = require('../middleware/auth');
const Review = require('../models/Review');
const Listing = require('../models/Listing');

// @route   POST /api/reviews/:propertyId
// @desc    Create review for a property
// @access  Private (Customer only)
router.post(
  '/:propertyId',
  [
    authMiddleware,
    requireRole,
    requireCustomer,
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().trim().withMessage('Comment is required')
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

      const { propertyId } = req.params;
      const { rating, comment } = req.body;

      // Check if property exists
      const property = await Listing.findById(propertyId);
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          message: 'Property not found' 
        });
      }

      // Check if user is trying to review their own property
      if (property.ownerId.toString() === req.user._id.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot review your own property' 
        });
      }

      // Create review
      const review = new Review({
        user: req.user._id,
        property: propertyId,
        rating,
        comment
      });

      await review.save();
      await review.populate('user', 'name');

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review
      });
    } catch (error) {
      // Handle duplicate review error
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already reviewed this property' 
        });
      }
      console.error('Create review error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   PUT /api/reviews/:reviewId
// @desc    Update review
// @access  Private (Review owner only)
router.put(
  '/:reviewId',
  [
    authMiddleware,
    requireRole,
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().notEmpty().trim().withMessage('Comment cannot be empty')
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

      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }

      // Check if user owns the review
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this review' 
        });
      }

      // Update fields
      if (req.body.rating) review.rating = req.body.rating;
      if (req.body.comment) review.comment = req.body.comment;

      await review.save();
      await review.populate('user', 'name');

      res.json({
        success: true,
        message: 'Review updated successfully',
        review
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete review
// @access  Private (Review owner only)
router.delete('/:reviewId', authMiddleware, requireRole, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/reviews/:propertyId
// @desc    Get all reviews for a property with average rating
// @access  Public
router.get('/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      success: true,
      totalReviews,
      averageRating: parseFloat(averageRating),
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
