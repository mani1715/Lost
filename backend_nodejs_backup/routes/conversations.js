const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const { authMiddleware } = require('../middleware/auth');

// Create or get existing conversation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { listingId, ownerId } = req.body;
    const customerId = req.user.userId;

    // Validate listing exists and owner is correct
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.owner.toString() !== ownerId) {
      return res.status(400).json({ success: false, message: 'Invalid owner for this listing' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [customerId, ownerId] },
      listingId: listingId
    }).populate('participants', 'name email role')
      .populate('listingId', 'title address');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [customerId, ownerId],
        listingId: listingId
      });
      await conversation.save();
      
      // Populate the fields
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role')
        .populate('listingId', 'title address');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all conversations for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email role')
    .populate('listingId', 'title address price')
    .sort({ updatedAt: -1 });

    // Get unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: userId,
          isRead: false
        });
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark messages as read
router.put('/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    await Message.updateMany(
      { 
        conversationId, 
        receiverId: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;