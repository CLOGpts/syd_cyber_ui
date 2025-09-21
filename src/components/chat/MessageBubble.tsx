
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

  // 🔴 TALIBAN CHECK: After Q7, block EVERYTHING except report
  const [isTalibanLocked, setIsTalibanLocked] = useState(false);
  useEffect(() => {
    const checkTaliban = () => {
      const step = chatStore.getState().riskFlowStep;
      const taliban = step === 'assessment_q7' ||
                     step === 'assessment_q8' ||
                     step === 'assessment_complete' ||
                     step === 'completed';
      setIsTalibanLocked(taliban);
    };
    checkTaliban();
    const interval = setInterval(checkTaliban, 500);
    return () => clearInterval(interval);
  }, []);

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
    const { handleUserMessage, cleanRestartAssessment } = useRiskFlow();

    const handleCategoryClick = async (categoryId: string) => {
      const isLocked = chatStore.getState().isProcessLocked();

      if (isLocked) {
        const confirmed = window.confirm(
          '⚠️ Risk Assessment in corso\n\nVuoi abbandonare l\'assessment corrente e iniziarne uno nuovo?\n\nClicca OK per confermare o Annulla per continuare l\'assessment corrente.'
        );

        if (confirmed) {
          await cleanRestartAssessment();
          // Dopo il restart, processa la categoria
          await handleUserMessage(categoryId);
        }
        return;
      }

      // CHECK: Se siamo in waiting_category è un cambio, NON aggiungere messaggio
      const currentStep = chatStore.getState().riskFlowStep;

      if (currentStep !== 'waiting_category') {
        // Solo per prima selezione aggiungi messaggio utente
        addMessage({
          id: `user-category-${Date.now()}`,
          text: categoryId,
          sender: 'user',
          timestamp: new Date().toISOString()
        });
      }

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
          <div className="relative">
            <RiskCategoryCards
              onCategorySelect={isTalibanLocked ? () => {} : handleCategoryClick}
              isDarkMode={isDarkMode}
            />
            {/* 🔴 TALIBAN: Block categories after Q7 */}
            {isTalibanLocked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-50" />
            )}
          </div>
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        </div>
      </motion.div>
    );
  }

  // Se è un messaggio con gli eventi risk, mostra le card eventi
  if (type === 'risk-events' && isAgent && riskEventsData) {
    const { showEventDescription, cleanRestartAssessment } = useRiskFlow();

    const handleEventClick = async (eventCode: string) => {
      const isLocked = chatStore.getState().isProcessLocked();

      if (isLocked) {
        const confirmed = window.confirm(
          '⚠️ Risk Assessment in corso\n\nVuoi abbandonare l\'assessment corrente e selezionare un nuovo evento?\n\nClicca OK per confermare o Annulla per continuare l\'assessment corrente.'
        );

        if (confirmed) {
          await cleanRestartAssessment(eventCode);
        }
        return;
      }

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
          <div className="relative">
            <RiskEventCards
              events={riskEventsData.events}
              categoryName={riskEventsData.categoryName}
              categoryGradient={riskEventsData.categoryGradient}
              onEventSelect={isTalibanLocked ? () => {} : handleEventClick}
              isDarkMode={isDarkMode}
            />
            {/* 🔴 TALIBAN: Block events after Q7 */}
            {isTalibanLocked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-50" />
            )}
          </div>
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
          <div className="relative">
            <RiskDescriptionCard
              {...riskDescriptionData}
              onContinue={isTalibanLocked ? () => {} : handleContinue}
              isDarkMode={isDarkMode}
            />
            {/* 🔴 TALIBAN: Block description after Q7 */}
            {isTalibanLocked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-50" />
            )}
          </div>
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
      // ANTIFRAGILE: Triple check before navigation
      if (isProcessing) {
        console.warn('⚠️ ANTIFRAGILE: Operation locked, ignoring');
        return;
      }

      // ANTIFRAGILE: Validate we can actually go back
      const currentQ = assessmentQuestionData.questionNumber;
      if (currentQ <= 1) {
        console.warn('⚠️ ANTIFRAGILE: Already at first question');
        return;
      }

      console.log('🔙 ANTIFRAGILE BACK - Question', currentQ, '→', currentQ - 1);

      // Lock state durante operazione
      setIsProcessing(true);

      try {
        // ANTIFRAGILE: Usa il sistema di back del flow invece di manipolare messaggi
        const { goBackOneStep } = useRiskFlow();
        const success = goBackOneStep();

        if (!success) {
          console.error('❌ ANTIFRAGILE: Back navigation failed');
          alert('Impossibile tornare indietro. Riprova o contatta il supporto.');
          return;
        }

        console.log('✅ ANTIFRAGILE: Navigation successful via flow system');

      } catch (error) {
        console.error('❌ ANTIFRAGILE: Error during back navigation:', error);
        alert('Errore durante la navigazione. Riprova o contatta il supporto.');
      } finally {
        // ANTIFRAGILE: Reset processing state
        setTimeout(() => {
          setIsProcessing(false);
          console.log('🔓 ANTIFRAGILE: Processing unlocked');
        }, 100); // Reduced for better UX
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
          <div className="relative">
            <AssessmentQuestionCard
              {...assessmentQuestionData}
              onAnswer={isTalibanLocked && assessmentQuestionData.userAnswer ? () => {} : handleAnswer}
              onEditAnswer={isTalibanLocked ? () => {} : handleEditAnswer}
              onGoBack={isTalibanLocked ? () => {} : handleGoBack}
              isDarkMode={isDarkMode}
              isAnswered={!!assessmentQuestionData.userAnswer}
              currentAnswer={assessmentQuestionData.userAnswer || ''}
              isNavigating={isProcessing}
            />
            {/* 🔴 TALIBAN: Block questions after Q7 if already answered */}
            {isTalibanLocked && assessmentQuestionData.userAnswer && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-50" />
            )}
          </div>
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
