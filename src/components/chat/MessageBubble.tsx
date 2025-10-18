
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
  const { addMessage, setRiskFlowState, riskSelectedCategory, selectedEventDescription } = useChatStore();
  const { isDarkMode, setShowRiskReport } = useAppStore();

  // ✅ NUOVO: Solo report finale è bloccato
  const [isTalibanLocked, setIsTalibanLocked] = useState(false);
  useEffect(() => {
    const checkLock = () => {
      const step = chatStore.getState().riskFlowStep;
      // Solo completed/assessment_complete sono bloccati
      const locked = step === 'assessment_complete' || step === 'completed';
      setIsTalibanLocked(locked);
    };
    checkLock();
    const interval = setInterval(checkLock, 500);
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

      // 🎯 TYPEFORM UX: NO messaggi utente visibili in chat
      // Il processing avviene internamente senza mostrare "clienti" come messaggio

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

      // 🎯 TYPEFORM UX: NO messaggi utente visibili
      // Chiama direttamente showEventDescription senza aggiungere messaggio
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
    const { handleUserMessage, goBackUniversal } = useRiskFlow();

    const handleContinue = async () => {
      // 🎯 TYPEFORM UX: NO messaggi utente visibili
      // Processa direttamente senza aggiungere messaggio "Sì"
      await handleUserMessage('sì');
    };

    const handleGoBack = () => {
      if (!isTalibanLocked) goBackUniversal();
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
              onGoBack={isTalibanLocked ? undefined : handleGoBack}
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
    const { handleUserMessage, startRiskFlow } = useRiskFlow();
    
    // 🎯 TYPEFORM UX: NO messaggi utente visibili
    const handleGenerateReport = () => {
      setShowRiskReport(true);
    };

    const handleAnotherEvent = () => {
      handleUserMessage('altro');
    };

    const handleChangeCategory = () => {
      handleUserMessage('cambia');
    };

    const handleEndSession = () => {
      // 🔄 NUOVA VALUTAZIONE: Resetta flow ma mantieni completedRisks
      console.log('🔄 Nuova Valutazione: Reset flow, mantengo completedRisks');

      // Pulisci messaggi assessment (mantieni solo chat normale)
      chatStore.setState(state => ({
        messages: state.messages.filter(m =>
          m.type !== 'assessment-question' &&
          m.type !== 'assessment-complete' &&
          m.type !== 'risk-description' &&
          m.type !== 'risk-events' &&
          m.type !== 'risk-categories'
        ),
        riskFlowStep: 'idle',
        riskAssessmentData: null,
        riskAssessmentFields: [],
        riskSelectedCategory: null,
        riskAvailableEvents: [],
        selectedEventCode: null,
        isRiskProcessLocked: false
        // ✅ completedRisks NON viene toccato - rimane accumulato!
      }));

      console.log('✅ Flow resettato. Rischi accumulati:', chatStore.getState().completedRisks.length);

      // 🎯 Fai partire un nuovo risk flow - CHIAMATA DIRETTA per evitare race conditions
      setTimeout(() => {
        startRiskFlow();
      }, 100);
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
    const { handleUserMessage, goBackUniversal, goForwardOneStep } = useRiskFlow();
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
        // 🎯 TYPEFORM UX: Aggiorna stato interno senza mostrare messaggio
        updateMessage(message.id, {
          assessmentQuestionData: {
            ...assessmentQuestionData,
            userAnswer: answer,
            answeredAt: new Date().toISOString()
          }
        });

        // Processa la risposta (NO addMessage visibile)
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
      // UNIVERSALE: Usa goBackUniversal che gestisce TUTTI i casi (anche Q1 → descrizione)
      if (isProcessing) {
        console.warn('⚠️ Operation locked, ignoring');
        return;
      }

      const currentQ = assessmentQuestionData.questionNumber;
      console.log('🔙 UNIVERSAL BACK - Question', currentQ);

      setIsProcessing(true);

      try {
        const success = goBackUniversal();

        if (!success) {
          console.error('❌ Back navigation failed');
          alert('Impossibile tornare indietro.');
          return;
        }

        console.log('✅ Back navigation successful');

      } catch (error) {
        console.error('❌ Error during back navigation:', error);
        alert('Errore durante la navigazione. Riprova o contatta il supporto.');
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
        }, 100);
      }
    };

    const handleGoForward = () => {
      // ANTIFRAGILE: Triple check before navigation
      if (isProcessing) {
        console.warn('⚠️ ANTIFRAGILE: Operation locked, ignoring');
        return;
      }

      const currentQ = assessmentQuestionData.questionNumber;
      console.log('➡️ FORWARD - Question', currentQ, '→', currentQ + 1);

      // Lock state durante operazione
      setIsProcessing(true);

      try {
        // Cambia direttamente lo step nel chatStore
        const state = chatStore.getState();
        const currentStep = state.riskFlowStep;

        if (!currentStep.startsWith('assessment_q')) {
          console.error('Not in assessment');
          setIsProcessing(false);
          return;
        }

        const currentQNum = parseInt(currentStep.replace('assessment_q', ''));
        const nextQ = currentQNum + 1;
        const totalQuestions = state.riskAssessmentFields.length;

        console.log(`Forward: Q${currentQNum} → Q${nextQ} (total: ${totalQuestions})`);

        if (nextQ > totalQuestions) {
          chatStore.setState({ riskFlowStep: 'assessment_complete' as any });
        } else {
          const targetStep = `assessment_q${nextQ}`;

          // CRITICAL FIX: Crea un nuovo messaggio per la prossima domanda
          const nextField = state.riskAssessmentFields[nextQ - 1];
          addMessage({
            id: `assessment-q${nextQ}-${Date.now()}`,
            text: '',
            type: 'assessment-question',
            sender: 'agent',
            timestamp: new Date().toISOString(),
            assessmentQuestionData: {
              questionNumber: nextQ,
              totalQuestions: totalQuestions,
              question: nextField.question,
              options: nextField.options.map((opt: any) =>
                typeof opt === 'object' ? opt.label || opt.text || opt.toString() : opt
              ),
              fieldName: nextField.field_name || nextField.name
            }
          });

          chatStore.setState({ riskFlowStep: targetStep as any });
          state.pushRiskHistory(targetStep as any, state.riskAssessmentData || {});
        }

        console.log('✅ Forward completed');

      } catch (error) {
        console.error('❌ Error during forward navigation:', error);
        alert('Errore durante la navigazione. Riprova o contatta il supporto.');
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
        }, 100);
      }
    };

    // 🎯 MAP CATEGORIA BACKEND → UI NAME + GRADIENT
    const categoryMap: Record<string, { name: string; gradient: string }> = {
      "Damage_Danni": { name: "DANNI FISICI", gradient: "from-sky-500 to-blue-600" },
      "Business_disruption": { name: "SISTEMI & IT", gradient: "from-blue-500 to-indigo-600" },
      "Employment_practices_Dipendenti": { name: "RISORSE UMANE", gradient: "from-cyan-500 to-sky-600" },
      "Execution_delivery_Problemi_di_produzione_o_consegna": { name: "OPERATIONS", gradient: "from-teal-500 to-cyan-600" },
      "Clients_product_Clienti": { name: "CLIENTI & COMPLIANCE", gradient: "from-blue-600 to-sky-500" },
      "Internal_Fraud_Frodi_interne": { name: "FRODI INTERNE", gradient: "from-indigo-500 to-blue-600" },
      "External_fraud_Frodi_esterne": { name: "FRODI ESTERNE", gradient: "from-sky-600 to-cyan-500" }
    };

    const categoryInfo = riskSelectedCategory ? categoryMap[riskSelectedCategory] : null;
    const eventDescription = selectedEventDescription || undefined;

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
              onGoForward={isTalibanLocked ? () => {} : handleGoForward}
              isDarkMode={isDarkMode}
              isAnswered={!!assessmentQuestionData.userAnswer}
              currentAnswer={assessmentQuestionData.userAnswer || ''}
              isNavigating={isProcessing}
              categoryName={categoryInfo?.name}
              categoryGradient={categoryInfo?.gradient}
              eventDescription={eventDescription}
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
