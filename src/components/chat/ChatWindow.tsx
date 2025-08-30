// src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChat';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import TypingIndicator from './TypingIndicator';

const ChatWindow: React.FC = () => {
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Detect user scrolling
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsUserScrolling(!isAtBottom);
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new messages arrive (if not user scrolling)
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isUserScrolling]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card-light dark:bg-card-dark rounded-2xl shadow-lg overflow-hidden relative">
      <div 
        ref={chatContainerRef}
        className="flex-1 p-6 overflow-y-auto scroll-smooth" 
        role="log" 
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                transition={{ delay: index * 0.05 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Floating scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsUserScrolling(false);
              scrollToBottom();
            }}
            className="absolute bottom-20 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      
      <ChatInputBar />
    </div>
  );
};

export default ChatWindow;
