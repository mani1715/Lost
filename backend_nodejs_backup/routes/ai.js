const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { generateDescription } = require('../services/aiService');

// @route   POST /api/ai/generate-description
// @desc    Generate property description using AI
// @access  Private (JWT protected)
router.post('/generate-description', authMiddleware, async (req, res) => {
  try {
    const { title, type, location, price, facilities } = req.body;

    // Build prompt
    const prompt = `You are a professional real estate copywriter.
Write a 150 word attractive property description.

Title: ${title}
Type: ${type}
Location: ${location}
Price: ${price}
Facilities: ${facilities}`;

    // Call generateDescription
    const description = await generateDescription(prompt);

    // Return description
    res.json({
      success: true,
      description
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate description'
    });
  }
});

module.exports = router;
