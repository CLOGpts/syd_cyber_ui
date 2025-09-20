
import React, { useState, useEffect } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useChatStore } from '../../store';
import { useAppStore } from '../../store/useStore';
import { chatStore } from '../../store/chatStore';
import ATECOResponseCard from './ATECOResponseCard';
import RiskCategoryCards from '../risk/RiskCategoryCards';
import RiskEventCards from '../risk/RiskEventCards';
import RiskDescriptionCard from '../risk/RiskDescriptionCard';
import AssessmentQuestionCard from '../risk/AssessmentQuestionCard';
import AssessmentCompleteCard from '../risk/AssessmentCompleteCard';
import ControlDescriptionCard from '../risk/ControlDescriptionCard';
import VisuraOutputCard from '../visura/VisuraOutputCard';
import { useRiskFlow } from '../../hooks/useRiskFlow';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, text, timestamp, type, atecoData, riskData, riskEventsData, riskDescriptionData, assessmentQuestionData, visuraOutputData, assessmentCompleteData, controlDescriptionData } = message;
  const isAgent = sender === 'agent';
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const { addMessage, setRiskFlowState } = useChatStore();
  const { isDarkMode, setShowRiskReport } = useAppStore();

  const handleCopy = () => {
    const copyText = type === 'ateco-response' && atecoData 
      ? JSON.stringify(atecoData, null, 2) 
      : text;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleClasses = isAgent
    ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'
    : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white';
  
  const alignmentClasses = isAgent ? 'justify-start' : 'justify-end';
  const avatarOrder = isAgent ? 'order-1' : 'order-2';
  const textOrder = isAgent ? 'order-2' : 'order-1';
  
  const Avatar = () => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAgent ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
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
        <div className={`max-w-[90%] lg:max-w-[95%] group relative ${textOrder}`}>
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
        <div className={`max-w-[90%] lg:max-w-[95%] group relative ${textOrder}`}>
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
        <div className={`w-full ${textOrder}`}>
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

  // Se è una descrizione del controllo, mostra la card dedicata
  if (type === 'control-description' && isAgent && controlDescriptionData) {
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
          <ControlDescriptionCard 
            {...controlDescriptionData}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è un output visura, mostra la card dedicata
  if (type === 'visura-output' && isAgent && visuraOutputData) {
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
          <VisuraOutputCard 
            visuraData={visuraOutputData}
            isDarkMode={isDarkMode}
          />
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è un assessment completato, mostra la card dedicata
  if (type === 'assessment-complete' && isAgent && assessmentCompleteData) {
    const { handleUserMessage } = useRiskFlow();
    
    const handleGenerateReport = () => {
      addMessage({
        id: `user-report-${Date.now()}`,
        text: 'genera report',
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      setShowRiskReport(true);
    };
    
    const handleAnotherEvent = () => {
      addMessage({
        id: `user-altro-${Date.now()}`,
        text: 'altro',
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      handleUserMessage('altro');
    };
    
    const handleChangeCategory = () => {
      addMessage({
        id: `user-cambia-${Date.now()}`,
        text: 'cambia',
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      handleUserMessage('cambia');
    };
    
    const handleEndSession = () => {
      addMessage({
        id: `user-fine-${Date.now()}`,
        text: 'fine',
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      handleUserMessage('fine');
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
          <AssessmentCompleteCard 
            {...assessmentCompleteData}
            onGenerateReport={handleGenerateReport}
            onAnotherEvent={handleAnotherEvent}
            onChangeCategory={handleChangeCategory}
            onEndSession={handleEndSession}
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
    const { updateMessage } = useChatStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAnswer = async (answer: string) => {
      // WARFARE: Check if processing
      if (isProcessing) {
        console.warn('⚠️ WARFARE: Answer blocked, processing');
        return;
      }

      // WARFARE: Lock during answer
      setIsProcessing(true);

      try {
        // NUOVO: Aggiorna il messaggio corrente con la risposta
        updateMessage(message.id, {
          assessmentQuestionData: {
            ...assessmentQuestionData,
            userAnswer: answer,
            answeredAt: new Date().toISOString()
          }
        });

        // Aggiungi messaggio utente con la risposta
        addMessage({
          id: `user-answer-${Date.now()}`,
          text: answer,
          sender: 'user',
          timestamp: new Date().toISOString()
        });

        // Processa la risposta
        await handleUserMessage(answer);
      } finally {
        // Unlock after processing
        setTimeout(() => setIsProcessing(false), 100);
      }
    };

    const handleEditAnswer = async (newAnswer: string) => {
      // NUOVO: Permette modifica risposta
      console.log('🔄 Editing answer for question', assessmentQuestionData.questionNumber, 'to:', newAnswer);

      // Aggiorna il messaggio con la nuova risposta
      updateMessage(message.id, {
        assessmentQuestionData: {
          ...assessmentQuestionData,
          userAnswer: newAnswer,
          answeredAt: new Date().toISOString()
        }
      });

      // TODO: Implementare logica per ricalcolo assessment con nuova risposta
    };

    const handleGoBack = () => {
      // WARFARE: Triple check before navigation
      if (isProcessing) {
        console.warn('⚠️ WARFARE: Operation locked, ignoring');
        return;
      }

      // WARFARE: Validate we can actually go back
      const currentQ = assessmentQuestionData.questionNumber;
      if (currentQ <= 1) {
        console.warn('⚠️ WARFARE: Already at first question');
        return;
      }

      console.log('🔙 WARFARE BACK - Question', currentQ, '→', currentQ - 1);

      // Lock state durante operazione
      setIsProcessing(true);

      try {
        const currentMessages = chatStore.getState().messages;
        const currentIndex = currentMessages.findIndex(m => m.id === message.id);

        // VALIDATION: Verifica che possiamo andare indietro
        if (currentIndex <= 0) {
          console.error('❌ Cannot go back: no previous question');
          return;
        }

        // VALIDATION: Verifica che il messaggio precedente sia una risposta utente
        const previousMessage = currentMessages[currentIndex - 1];
        if (!previousMessage || previousMessage.sender !== 'user') {
          console.error('❌ Invalid state: previous message is not user answer');
          return;
        }

        // SNAPSHOT: Salva stato corrente per rollback
        const snapshot = [...currentMessages];

        try {
          // Rimuovi questo messaggio e quello prima
          const newMessages = currentMessages.slice(0, currentIndex - 1);

          // WARFARE: Multi-layer validation
          if (newMessages.length < 2) {
            console.error('❌ WARFARE: Would corrupt state: too few messages');
            return;
          }

          // WARFARE: Verify last message is question
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg?.type && lastMsg.type !== 'assessment-question') {
            console.warn('⚠️ WARFARE: Last msg not question, searching...');
            const lastQuestion = [...newMessages].reverse().find(m => m.type === 'assessment-question');
            if (!lastQuestion) {
              console.error('❌ WARFARE: No question found!');
              return;
            }
          }

          chatStore.setState({ messages: newMessages });
          console.log('✅ WARFARE: Navigation successful');

        } catch (error) {
          // ROLLBACK in caso di errore
          console.error('❌ Error during back navigation, rolling back:', error);
          chatStore.setState({ messages: snapshot });
        }

      } finally {
        // WARFARE: CRITICAL FIX - Reset processing state
        setTimeout(() => {
          setIsProcessing(false);
          console.log('🔓 WARFARE: Processing unlocked');
        }, 300); // Reduced to 300ms for better UX
      }
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
            onEditAnswer={handleEditAnswer}
            onGoBack={handleGoBack}
            isDarkMode={isDarkMode}
            isAnswered={!!assessmentQuestionData.userAnswer}
            currentAnswer={assessmentQuestionData.userAnswer || ''}
            isNavigating={isProcessing}
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
      <div className={`max-w-[85%] sm:max-w-[90%] lg:max-w-[95%] group relative ${textOrder}`}>
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
