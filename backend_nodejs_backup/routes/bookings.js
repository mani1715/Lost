const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole, requireCustomer, requireOwner } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @route   POST /api/bookings/:propertyId
// @desc    Create booking request
// @access  Private (Customer only)
router.post(
  '/:propertyId',
  [
    authMiddleware,
    requireRole,
    requireCustomer,
    body('message').optional().trim()
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
      const { message } = req.body;

      // Check if property exists
      const property = await Listing.findById(propertyId);
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          message: 'Property not found' 
        });
      }

      // Check if customer is trying to book their own property
      if (property.ownerId.toString() === req.user._id.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot book your own property' 
        });
      }

      // Check for duplicate pending booking
      const existingPendingBooking = await Booking.findOne({
        customer: req.user._id,
        property: propertyId,
        status: 'pending'
      });

      if (existingPendingBooking) {
        return res.status(400).json({ 
          success: false, 
          message: 'You already have a pending booking for this property' 
        });
      }

      // Create booking
      const booking = new Booking({
        customer: req.user._id,
        property: propertyId,
        owner: property.ownerId,
        message: message || ''
      });

      await booking.save();
      await booking.populate([
        { path: 'property', select: 'title images price addressText' },
        { path: 'customer', select: 'name email' },
        { path: 'owner', select: 'name email' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Booking request sent successfully',
        booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   GET /api/bookings/customer
// @desc    Get logged-in customer's bookings
// @access  Private (Customer only)
router.get('/customer', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('property', 'title images price addressText type')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/bookings/owner
// @desc    Get bookings for properties owned by logged-in owner
// @access  Private (Owner only)
router.get('/owner', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title images price addressText type')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/bookings/:bookingId/status
// @desc    Owner updates booking status (approve/reject)
// @access  Private (Owner only)
router.put(
  '/:bookingId/status',
  [
    authMiddleware,
    requireRole,
    requireOwner,
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
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

      const booking = await Booking.findById(req.params.bookingId);

      if (!booking) {
        return res.status(404).json({ 
          success: false, 
          message: 'Booking not found' 
        });
      }

      // Check if owner owns the property
      if (booking.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this booking' 
        });
      }

      // Check if already processed
      if (booking.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: `Booking is already ${booking.status}` 
        });
      }

      booking.status = req.body.status;
      await booking.save();
      await booking.populate([
        { path: 'property', select: 'title images price addressText type' },
        { path: 'customer', select: 'name email' },
        { path: 'owner', select: 'name email' }
      ]);

      res.json({
        success: true,
        message: `Booking ${booking.status} successfully`,
        booking
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

// @route   DELETE /api/bookings/:bookingId
// @desc    Customer cancels booking (only if pending)
// @access  Private (Customer only)
router.delete('/:bookingId', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if customer owns the booking
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Can only cancel pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only cancel pending bookings' 
      });
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
