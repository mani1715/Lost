const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['room', 'house', 'lodge', 'pg', 'hostel', 'apartment', 'villa', 'cottage', 'farmhouse', 'studio']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  priceType: {
    type: String,
    enum: ['daily', 'monthly', 'both'],
    default: 'monthly'
  },
  dailyPrice: {
    type: Number,
    min: 0
  },
  monthlyPrice: {
    type: Number,
    min: 0
  },
  squareFeet: {
    type: Number,
    required: [true, 'Square feet is required'],
    min: 0
  },
  facilities: {
    type: [String],
    default: []
  },
  addressText: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  googleMapsLink: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  bedrooms: {
    type: Number,
    default: 1
  },
  bathrooms: {
    type: Number,
    default: 1
  },
  availableFrom: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
