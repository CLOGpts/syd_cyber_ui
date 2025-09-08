
import React, { useState, useEffect } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useChatStore } from '../../store/useChat';
import { useAppStore } from '../../store/useStore';
import ATECOResponseCard from './ATECOResponseCard';
import RiskCategoryCards from '../risk/RiskCategoryCards';
import RiskEventCards from '../risk/RiskEventCards';
import RiskDescriptionCard from '../risk/RiskDescriptionCard';
import AssessmentQuestionCard from '../risk/AssessmentQuestionCard';
import { useRiskFlow } from '../../hooks/useRiskFlow';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, text, timestamp, type, atecoData, riskData, riskEventsData, riskDescriptionData, assessmentQuestionData } = message;
  const isAgent = sender === 'agent';
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const { addMessage, setRiskFlowState } = useChatStore();
  const { isDarkMode } = useAppStore();

  const handleCopy = () => {
    const copyText = type === 'ateco-response' && atecoData 
      ? JSON.stringify(atecoData, null, 2) 
      : text;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleClasses = isAgent
    ? 'bg-slate-200 dark:bg-slate-700'
    : 'bg-primary-light text-white';
  
  const alignmentClasses = isAgent ? 'justify-start' : 'justify-end';
  const avatarOrder = isAgent ? 'order-1' : 'order-2';
  const textOrder = isAgent ? 'order-2' : 'order-1';
  
  const Avatar = () => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAgent ? 'bg-slate-400' : 'bg-blue-400'}`}>
      {isAgent ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
    </div>
  );

  // Varianti di animazione per i messaggi
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      x: isAgent ? -50 : 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.5
      }
    }
  };

  // Se è una risposta ATECO strutturata, usa il componente card
  if (type === 'ateco-response' && atecoData && isAgent) {
    return (
      <motion.div 
        className={`flex items-start gap-2 ${alignmentClasses}`}
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className={avatarOrder}>
          <Avatar />
        </div>
        <div className={`max-w-3xl group relative ${textOrder}`}>
          <ATECOResponseCard data={atecoData} />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
          <button
            onClick={handleCopy}
            className="absolute -top-3 -right-3 p-1.5 bg-card-light dark:bg-slate-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title={copied ? t.copied : t.copy}
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-text-muted-light dark:text-text-muted-dark" />}
          </button>
        </div>
      </motion.div>
    );
  }

  // Se è un messaggio con le categorie risk, mostra le card
  if (type === 'risk-categories' && isAgent) {
    const { handleUserMessage } = useRiskFlow();
    
    const handleCategoryClick = async (categoryId: string) => {
      // 1. Aggiungi messaggio dell'utente
      addMessage({
        id: `user-category-${Date.now()}`,
        text: categoryId,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      
      // 2. Processa la categoria attraverso il flusso esistente
      // Questo chiamerà processCategory che farà tutto il resto
      await handleUserMessage(categoryId);
    };
    
    return (
      <motion.div 
        className={`flex items-start gap-2 ${alignmentClasses}`}
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className={avatarOrder}>
          <Avatar />
        </div>
        <div className={`max-w-full group relative ${textOrder}`}>
          <RiskCategoryCards 
            onCategorySelect={handleCategoryClick}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è un messaggio con gli eventi risk, mostra le card eventi
  if (type === 'risk-events' && isAgent && riskEventsData) {
    const { showEventDescription } = useRiskFlow();
    
    const handleEventClick = async (eventCode: string) => {
      // 1. Aggiungi messaggio dell'utente con il codice evento
      addMessage({
        id: `user-event-${Date.now()}`,
        text: `Evento selezionato: ${eventCode}`,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      
      // 2. Chiama direttamente showEventDescription invece di passare per handleUserMessage
      await showEventDescription(eventCode);
    };
    
    return (
      <motion.div 
        className={`flex items-start gap-2 ${alignmentClasses}`}
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className={avatarOrder}>
          <Avatar />
        </div>
        <div className={`max-w-full group relative ${textOrder}`}>
          <RiskEventCards 
            events={riskEventsData.events}
            categoryName={riskEventsData.categoryName}
            categoryGradient={riskEventsData.categoryGradient}
            onEventSelect={handleEventClick}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è un messaggio con la descrizione del rischio, mostra la card
  if (type === 'risk-description' && isAgent && riskDescriptionData) {
    const { handleUserMessage } = useRiskFlow();
    
    const handleContinue = async () => {
      // Aggiungi messaggio utente "sì"
      addMessage({
        id: `user-continue-${Date.now()}`,
        text: 'Sì',
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      
      // Processa la risposta
      await handleUserMessage('sì');
    };
    
    return (
      <motion.div 
        className={`flex items-start gap-2 ${alignmentClasses}`}
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className={avatarOrder}>
          <Avatar />
        </div>
        <div className={`w-full ${textOrder}`}>
          <RiskDescriptionCard 
            {...riskDescriptionData}
            onContinue={handleContinue}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è una domanda di assessment, mostra la card
  if (type === 'assessment-question' && isAgent && assessmentQuestionData) {
    const { handleUserMessage } = useRiskFlow();
    
    const handleAnswer = async (answer: string) => {
      // Aggiungi messaggio utente con la risposta
      addMessage({
        id: `user-answer-${Date.now()}`,
        text: answer,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      
      // Processa la risposta
      await handleUserMessage(answer);
    };
    
    return (
      <motion.div 
        className={`flex items-start gap-2 ${alignmentClasses}`}
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className={avatarOrder}>
          <Avatar />
        </div>
        <div className={`w-full ${textOrder}`}>
          <AssessmentQuestionCard 
            {...assessmentQuestionData}
            onAnswer={handleAnswer}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Messaggio normale
  return (
    <motion.div 
      className={`flex items-end gap-2 ${alignmentClasses}`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}>
      <div className={avatarOrder}>
        <Avatar />
      </div>
      <div className={`max-w-md lg:max-w-2xl group relative ${textOrder}`}>
        <div className={`px-4 py-2 rounded-2xl ${bubbleClasses}`}>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
        <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        {isAgent && (
          <button
            onClick={handleCopy}
            className="absolute -top-3 -right-3 p-1.5 bg-card-light dark:bg-slate-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title={copied ? t.copied : t.copy}
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-text-muted-light dark:text-text-muted-dark" />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
