const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, requireCustomer, requireOwner } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @route   POST /api/bookings/:propertyId
// @desc    Create booking request
// @access  Private (Customer only)
router.post('/:propertyId', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find property by ID
    const property = await Listing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Create new Booking
    const booking = new Booking({
      customer: req.user._id,
      property: propertyId,
      owner: property.ownerId,
      status: 'pending'
    });

    await booking.save();

    // Return created booking
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/bookings/customer
// @desc    Get all bookings for logged-in customer
// @access  Private (Customer only)
router.get('/customer', authMiddleware, requireRole, requireCustomer, async (req, res) => {
  try {
    // Find all bookings where customer = logged-in user
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('property', 'title images')
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
// @desc    Get all bookings for properties owned by logged-in owner
// @access  Private (Owner only)
router.get('/owner', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    // Find all bookings where owner = logged-in user
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title')
      .populate('customer', 'name')
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
// @desc    Update booking status (approve/reject)
// @access  Private (Owner only)
router.put('/:bookingId/status', authMiddleware, requireRole, requireOwner, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be either approved or rejected' 
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Verify that the logged-in owner owns this booking
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this booking' 
      });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Return updated booking
    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
