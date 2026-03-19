import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const ChatButton = ({ onClick, className = '' }) => {
  return (
    <Button
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>Chat with Owner</span>
    </Button>
  );
};

export default ChatButton;