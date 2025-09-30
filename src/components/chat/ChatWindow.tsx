// src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages, useChatStore } from '../../store';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import TypingIndicator from './TypingIndicator';

const ChatWindow: React.FC = () => {
  const messages = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 🎯 TYPEFORM UX: Rileva se siamo in risk flow
  const { riskFlowStep, riskAssessmentFields, riskAssessmentData } = useChatStore(state => ({
    riskFlowStep: state.riskFlowStep,
    riskAssessmentFields: state.riskAssessmentFields,
    riskAssessmentData: state.riskAssessmentData
  }));
  const isInRiskFlow = riskFlowStep !== 'idle';

  // Hook per navigazione risk
  const { goBackOneStep, canGoBack, resetRiskFlow } = useRiskFlow();

  // 🎯 Keyboard Shortcuts durante Risk Flow
  useEffect(() => {
    if (!isInRiskFlow) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC = Back
      if (e.key === 'Escape' && canGoBack()) {
        e.preventDefault();
        goBackOneStep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInRiskFlow, canGoBack, goBackOneStep]);

  // 🎯 TYPEFORM UX: Disabilito auto-scroll per esperienza migliore
  const scrollToBottom = () => {
    // NON scrollare automaticamente - l'utente controlla la vista
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

  // Calcola progress e step label
  const getRiskProgress = (): { progress: number; stepLabel: string } => {
    if (!isInRiskFlow) return { progress: 0, stepLabel: '' };

    if (riskFlowStep === 'waiting_category') {
      return { progress: 10, stepLabel: '📂 Seleziona Categoria' };
    } else if (riskFlowStep === 'waiting_event') {
      return { progress: 25, stepLabel: '🎯 Seleziona Evento' };
    } else if (riskFlowStep === 'waiting_choice') {
      return { progress: 40, stepLabel: '📋 Conferma Evento' };
    } else if (riskFlowStep.startsWith('assessment_q')) {
      const qNum = parseInt(riskFlowStep.replace('assessment_q', ''));
      const totalQuestions = riskAssessmentFields.length || 7;
      const progressBase = 40 + ((qNum / totalQuestions) * 50);
      return { progress: progressBase, stepLabel: `❓ Domanda ${qNum}/${totalQuestions}` };
    } else if (riskFlowStep === 'completed' || riskFlowStep === 'assessment_complete') {
      return { progress: 100, stepLabel: '✅ Valutazione Completata' };
    }

    return { progress: 0, stepLabel: 'Risk Management' };
  };

  const { progress, stepLabel } = getRiskProgress();

  // Mostra il messaggio iniziale se non ci sono messaggi
  let displayMessages = messages.length === 0 ? [initialMessage] : messages;

  // 🎯 TYPEFORM UX PROFESSIONALE: Durante risk flow mostra SOLO l'ultima card
  if (isInRiskFlow && messages.length > 0) {
    // Trova l'ultimo messaggio risk (categorie, eventi, domande, etc)
    const lastRiskMessage = [...messages].reverse().find(msg =>
      msg.type === 'risk-categories' ||
      msg.type === 'risk-events' ||
      msg.type === 'risk-description' ||
      msg.type === 'assessment-question' ||
      msg.type === 'control-description' ||
      msg.type === 'assessment-complete'
    );

    if (lastRiskMessage) {
      // Mostra SOLO l'ultima card risk
      displayMessages = [lastRiskMessage];
    }
  }

  return (
    <div className="flex flex-col h-full bg-card-light dark:bg-card-dark rounded-2xl shadow-lg overflow-hidden relative">
      <div
        ref={chatContainerRef}
        className={`flex-1 p-6 ${isInRiskFlow ? 'overflow-y-auto flex items-center justify-center' : 'overflow-y-auto scroll-smooth'}`}
        role="log"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <div className={isInRiskFlow ? 'w-full' : 'space-y-4'}>
            {displayMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout={!isInRiskFlow}
                transition={{ delay: isInRiskFlow ? 0 : index * 0.05 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        {!isInRiskFlow && <div ref={messagesEndRef} />}
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

      {/* Navigation Bar rimossa - navigazione ora nelle card */}

      {/* Chat Input (nascosto durante risk flow) */}
      {!isInRiskFlow && <ChatInputBar />}
    </div>
  );
};

export default ChatWindow;
