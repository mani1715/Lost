import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const ChatModal = ({ isOpen, onClose, conversation, ownerId, listingId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { socket, connected } = useSocket();
  const { user, token } = useAuth();
  const messagesEndRef = useRef(null);
  const [currentConversation, setCurrentConversation] = useState(conversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create or get conversation when modal opens
  useEffect(() => {
    if (isOpen && !currentConversation && ownerId && listingId) {
      createOrGetConversation();
    }
  }, [isOpen, ownerId, listingId]);

  // Load messages when conversation is available
  useEffect(() => {
    if (currentConversation) {
      loadMessages();
      if (socket && connected) {
        socket.emit('joinConversation', currentConversation._id);
      }
    }

    return () => {
      if (socket && currentConversation) {
        socket.emit('leaveConversation', currentConversation._id);
      }
    };
  }, [currentConversation, socket, connected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !currentConversation) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      // Mark as read if not sender
      if (message.senderId._id !== user._id) {
        markAsRead();
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, currentConversation, user]);

  const createOrGetConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations`,
        { listingId, ownerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentConversation(response.data.conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages/${currentConversation._id || currentConversation.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages || []);
      markAsRead();
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!currentConversation) return;
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentConversation._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (socket && connected) {
        socket.emit('markAsRead', { conversationId: currentConversation._id });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    setSending(true);
    const messageText = newMessage.trim();

    try {
      if (socket && connected) {
        // Send via socket
        socket.emit('sendMessage', {
          conversationId: currentConversation._id || currentConversation.id,
          content: messageText
        });
      } else {
        // Fallback to HTTP
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/messages`,
          {
            conversationId: currentConversation._id || currentConversation.id,
            content: messageText
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.message]);
        }
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!currentConversation) return null;
    return currentConversation.participants.find(p => p._id !== user._id);
  };

  if (!isOpen) return null;

  const otherUser = getOtherParticipant();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h2 className="font-semibold text-lg">
                {otherUser ? otherUser.name : 'Chat'}
              </h2>
              {currentConversation?.listingId && (
                <p className="text-sm text-blue-100">
                  {currentConversation.listingId.title}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === user._id || message.senderId?._id === user._id;
              return (
                <div
                  key={message._id || message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content || message.messageText}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.createdAt), 'p')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending || loading}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;