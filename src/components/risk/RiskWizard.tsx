import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { useChatStore } from '../../store';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import ProgressBar from './ProgressBar';
import WizardStep from './WizardStep';
import RiskCategoryCards from './RiskCategoryCards';
import RiskEventCards from './RiskEventCards';
import RiskDescriptionCard from './RiskDescriptionCard';
import AssessmentQuestionCard from './AssessmentQuestionCard';
import AssessmentCompleteCard from './AssessmentCompleteCard';
import ControlDescriptionCard from './ControlDescriptionCard';

type WizardScreen =
  | 'categories'
  | 'events'
  | 'description'
  | 'assessment'
  | 'complete';

interface CompletedReport {
  id: string;
  timestamp: string;
  category: string;
  eventCode: string;
  riskScore: number;
  assessmentData: Record<string, any>;
}

interface RiskWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const RiskWizard: React.FC<RiskWizardProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useAppStore();
  const {
    riskFlowStep,
    riskSelectedCategory,
    riskAvailableEvents,
    riskAssessmentData,
    riskAssessmentFields,
    setRiskFlowState,
    setRiskAssessmentData,
    clearRiskHistory,
    selectedEventCode
  } = useChatStore(state => ({
    riskFlowStep: state.riskFlowStep,
    riskSelectedCategory: state.riskSelectedCategory,
    riskAvailableEvents: state.riskAvailableEvents,
    riskAssessmentData: state.riskAssessmentData,
    riskAssessmentFields: state.riskAssessmentFields,
    setRiskFlowState: state.setRiskFlowState,
    setRiskAssessmentData: state.setRiskAssessmentData,
    clearRiskHistory: state.clearRiskHistory,
    selectedEventCode: state.selectedEventCode
  }));

  const {
    startRiskFlow,
    showEventDescription,
    handleUserMessage,
    goBackOneStep,
    canGoBack,
    resetRiskFlow
  } = useRiskFlow();

  const [currentScreen, setCurrentScreen] = useState<WizardScreen>('categories');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedReports, setCompletedReports] = useState<CompletedReport[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🎯 Sincronizza currentScreen con riskFlowStep
  useEffect(() => {
    if (riskFlowStep === 'idle' || riskFlowStep === 'waiting_category') {
      setCurrentScreen('categories');
    } else if (riskFlowStep === 'waiting_event') {
      setCurrentScreen('events');
    } else if (riskFlowStep === 'waiting_choice') {
      setCurrentScreen('description');
    } else if (riskFlowStep.startsWith('assessment_q')) {
      setCurrentScreen('assessment');
      const qNum = parseInt(riskFlowStep.replace('assessment_q', ''));
      setCurrentQuestionIndex(qNum - 1);
    } else if (riskFlowStep === 'completed' || riskFlowStep === 'assessment_complete') {
      setCurrentScreen('complete');
    }
  }, [riskFlowStep]);

  // 🚀 Inizializza wizard all'avvio
  useEffect(() => {
    if (riskFlowStep === 'idle') {
      startRiskFlow();
    }
  }, []);

  // 📊 Calcola step corrente per progress bar
  const calculateProgress = (): { current: number; total: number } => {
    switch (currentScreen) {
      case 'categories':
        return { current: 1, total: 10 };
      case 'events':
        return { current: 2, total: 10 };
      case 'description':
        return { current: 3, total: 10 };
      case 'assessment':
        return { current: 4 + currentQuestionIndex, total: 10 };
      case 'complete':
        return { current: 10, total: 10 };
      default:
        return { current: 1, total: 10 };
    }
  };

  // 📂 Handler selezione categoria
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await handleUserMessage(categoryId);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [handleUserMessage, isProcessing]);

  // 🎯 Handler selezione evento
  const handleEventSelect = useCallback(async (eventCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await showEventDescription(eventCode);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [showEventDescription, isProcessing]);

  // ✅ Handler conferma descrizione (procedi con assessment)
  const handleDescriptionContinue = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await handleUserMessage('sì');
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [handleUserMessage, isProcessing]);

  // 📝 Handler risposta assessment
  const handleAssessmentAnswer = useCallback(async (answer: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await handleUserMessage(answer);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [handleUserMessage, isProcessing]);

  // ⬅️ Handler back navigation
  const handleBack = useCallback(() => {
    if (isProcessing) return;

    if (currentScreen === 'assessment' && canGoBack()) {
      goBackOneStep();
    } else if (currentScreen === 'events') {
      // Torna a categorie
      setRiskFlowState('waiting_category');
      clearRiskHistory();
    } else if (currentScreen === 'description') {
      // Torna a eventi
      setRiskFlowState('waiting_event', riskSelectedCategory, riskAvailableEvents);
    }
  }, [currentScreen, canGoBack, goBackOneStep, isProcessing, setRiskFlowState, clearRiskHistory, riskSelectedCategory, riskAvailableEvents]);

  // 🏠 Handler reset completo
  const handleReset = useCallback(() => {
    resetRiskFlow();
    setCurrentScreen('categories');
    setCurrentQuestionIndex(0);
    startRiskFlow();
  }, [resetRiskFlow, startRiskFlow]);

  // 🚪 Handler chiudi wizard
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ➕ Handler nuovo assessment (multi-report)
  const handleNewAssessment = useCallback(() => {
    // Salva report corrente
    if (riskAssessmentData && selectedEventCode) {
      const newReport: CompletedReport = {
        id: `report-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: riskSelectedCategory || '',
        eventCode: selectedEventCode,
        riskScore: 0, // TODO: Calcolare score reale
        assessmentData: { ...riskAssessmentData }
      };
      setCompletedReports(prev => [...prev, newReport]);
    }

    // Reset per nuovo assessment
    handleReset();
  }, [riskAssessmentData, selectedEventCode, riskSelectedCategory, handleReset]);

  // 🎨 Renderizza contenuto step corrente
  const renderStepContent = () => {
    switch (currentScreen) {
      case 'categories':
        return (
          <RiskCategoryCards
            onCategorySelect={handleCategorySelect}
            isDarkMode={isDarkMode}
          />
        );

      case 'events':
        if (!riskAvailableEvents || riskAvailableEvents.length === 0) {
          return (
            <div className="text-center py-12">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading events...
              </p>
            </div>
          );
        }

        return (
          <RiskEventCards
            events={riskAvailableEvents}
            categoryName={riskSelectedCategory || ''}
            categoryGradient="from-blue-500 to-purple-500"
            onEventSelect={handleEventSelect}
            isDarkMode={isDarkMode}
          />
        );

      case 'description':
        if (!riskAssessmentData || !selectedEventCode) {
          return (
            <div className="text-center py-12">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading description...
              </p>
            </div>
          );
        }

        return (
          <RiskDescriptionCard
            eventCode={selectedEventCode}
            eventName={`Event ${selectedEventCode}`}
            category={riskSelectedCategory || ''}
            severity="medium"
            description="Risk event description"
            probability="Medium"
            impact="Significant"
            controls="Standard"
            monitoring="Quarterly"
            onContinue={handleDescriptionContinue}
            isDarkMode={isDarkMode}
          />
        );

      case 'assessment':
        const currentField = riskAssessmentFields[currentQuestionIndex];

        if (!currentField) {
          return (
            <div className="text-center py-12">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading question...
              </p>
            </div>
          );
        }

        return (
          <AssessmentQuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={riskAssessmentFields.length}
            question={currentField.question}
            options={currentField.options.map((opt: any) =>
              typeof opt === 'object' ? opt.label || opt.text || opt.toString() : opt
            )}
            fieldName={currentField.field_name}
            onAnswer={handleAssessmentAnswer}
            onGoBack={handleBack}
            isDarkMode={isDarkMode}
            isNavigating={isProcessing}
          />
        );

      case 'complete':
        return (
          <AssessmentCompleteCard
            riskScore={75} // TODO: Get real score
            riskLevel="Medium"
            analysis="Risk assessment completed"
            onGenerateReport={() => {}}
            onAnotherEvent={handleNewAssessment}
            onChangeCategory={handleReset}
            onEndSession={() => {}}
            isDarkMode={isDarkMode}
          />
        );

      default:
        return null;
    }
  };

  const progress = calculateProgress();

  if (!isOpen) return null;

  return (
    <div className={`
      fixed inset-0 flex flex-col z-50
      ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}
    `}>
      {/* Top Progress Bar */}
      <ProgressBar
        currentStep={progress.current}
        totalSteps={progress.total}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Area - Fixed Center */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <WizardStep
          stepKey={`${currentScreen}-${currentQuestionIndex}`}
          isDarkMode={isDarkMode}
        >
          {renderStepContent()}
        </WizardStep>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 flex items-center justify-between">
        {/* Back Button */}
        {(currentScreen === 'events' || currentScreen === 'description' || (currentScreen === 'assessment' && canGoBack())) && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            disabled={isProcessing}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2
              ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'}
              transition-colors shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>
        )}

        <div className="flex-1" />

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClose}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}
            text-white transition-colors shadow-lg
          `}
        >
          Close
        </motion.button>

        {/* Restart Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReset}
          className={`
            ml-2 px-4 py-2 rounded-lg flex items-center gap-2
            ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'}
            transition-colors shadow-lg
          `}
        >
          <Home size={20} />
          Restart
        </motion.button>

        {/* New Assessment Button (only on complete screen) */}
        {currentScreen === 'complete' && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleNewAssessment}
            className={`
              ml-2 px-4 py-2 rounded-lg flex items-center gap-2
              ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
              text-white transition-colors shadow-lg
            `}
          >
            <Plus size={20} />
            New Assessment
          </motion.button>
        )}
      </div>

      {/* Completed Reports Counter */}
      {completedReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 right-4 px-4 py-2 rounded-full bg-blue-500 text-white shadow-lg"
        >
          {completedReports.length} Report{completedReports.length > 1 ? 's' : ''} Completed
        </motion.div>
      )}
    </div>
  );
};

export default RiskWizard;
