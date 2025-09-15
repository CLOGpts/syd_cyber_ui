// src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '../../store';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import TypingIndicator from './TypingIndicator';

const ChatWindow: React.FC = () => {
  const messages = useMessages();
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

  // Messaggio iniziale quando la chat è vuota
  const initialMessage = {
    id: 'initial-message',
    text: "⚠️ **Questa chat è dedicata esclusivamente al Risk Management.**\n\nPer navigare i rischi:\n• Scrivi **'risk'** per iniziare\n• Scegli una categoria (es: clienti, danni, sistemi)\n• Seleziona un evento per numero o codice\n\n📊 **Analizza ATECO** - Nella sidebar a sinistra, inserisci il tuo codice ATECO e ottieni un PRE-REPORT immediato con rischi del settore e normative. Perfetto per prepararsi prima del Risk Management completo.\n\n💡 **Syd AI** - Non serve essere esperti! Usa il bottone in basso a destra e Syd ti guiderà passo passo nel pre-report, ti spiegherà i rischi in modo semplice e ti aiuterà a capire tutto!",
    sender: 'agent' as const,
    timestamp: new Date().toISOString(),
  };

  // Mostra il messaggio iniziale se non ci sono messaggi
  const displayMessages = messages.length === 0 ? [initialMessage] : messages;

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
            {displayMessages.map((msg, index) => (
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
