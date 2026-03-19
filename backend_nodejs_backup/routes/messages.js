const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authMiddleware } = require('../middleware/auth');

// Send message (fallback if socket not connected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversationId, receiverId, messageText } = req.body;
    const senderId = req.user.userId;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      receiverId,
      messageText
    });

    await message.save();

    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = messageText;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate message before sending response
    await message.populate('senderId', 'name email role');
    await message.populate('receiverId', 'name email role');

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;