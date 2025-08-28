
import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useStore';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import TypingIndicator from './TypingIndicator';

const ChatWindow: React.FC = () => {
  const { messages, isSydTyping } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSydTyping]);

  return (
    <div className="flex flex-col h-full bg-card-light dark:bg-card-dark rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto" role="log" aria-live="polite">
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isSydTyping && <TypingIndicator />}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <ChatInputBar />
    </div>
  );
};

export default ChatWindow;
