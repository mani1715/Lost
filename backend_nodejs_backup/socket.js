const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGINS || '*',
      credentials: true
    }
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, receiverId, messageText } = data;
        const senderId = socket.userId;

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(senderId)) {
          socket.emit('error', { message: 'Unauthorized or conversation not found' });
          return;
        }

        // Create and save message
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

        // Populate message
        await message.populate('senderId', 'name email role');
        await message.populate('receiverId', 'name email role');

        // Emit to all users in the conversation room
        io.to(conversationId).emit('receiveMessage', message);

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.userId;

        await Message.updateMany(
          { 
            conversationId, 
            receiverId: userId, 
            isRead: false 
          },
          { isRead: true }
        );

        // Notify the sender that messages were read
        socket.to(conversationId).emit('messagesRead', { conversationId, userId });

        console.log(`Messages marked as read in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit('userTyping', { 
        userId: socket.userId, 
        isTyping 
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
