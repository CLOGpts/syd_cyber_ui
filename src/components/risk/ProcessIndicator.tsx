import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Lock } from 'lucide-react';
import { chatStore } from '../../store/chatStore';
import { useRiskFlow } from '../../hooks/useRiskFlow';

const ProcessIndicator: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [isTalibanLocked, setIsTalibanLocked] = useState(false); // 🔴 TALIBAN CHECK
  const { resetRiskFlow } = useRiskFlow();

  useEffect(() => {
    const checkState = () => {
      const state = chatStore.getState();
      setIsLocked(state.isRiskProcessLocked);
      const step = state.riskFlowStep;
      setCurrentStep(step);
      // 🔴 TALIBAN: After Q7, NO EXIT allowed
      const taliban = step === 'assessment_q7' ||
                     step === 'assessment_q8' ||
                     step === 'assessment_complete' ||
                     step === 'completed';
      setIsTalibanLocked(taliban);
    };

    checkState();
    const interval = setInterval(checkState, 500);
    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    // 🔴 TALIBAN: NO EXIT after Q7
    if (isTalibanLocked) {
      console.log('🔴 TALIBAN: Exit blocked after Q7');
      return;
    }
    setShowConfirm(true);
  };

  const confirmExit = () => {
    console.log('❌ LOCKDOWN: User cancelled Risk Assessment');
    resetRiskFlow();
    setShowConfirm(false);
    setIsLocked(false);
  };

  if (!isLocked) return null;

  return (
    <>
      {/* Process Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-[60] max-w-sm"
      >
        <div className="bg-orange-500 text-white p-4 rounded-lg shadow-2xl border-2 border-orange-600">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Lock size={24} className="text-white" />
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">
                {isTalibanLocked ? '🔴 REPORT COMPLETATO' : 'Risk Assessment in corso'}
              </p>
              <p className="text-sm opacity-90 mt-1">
                {isTalibanLocked
                  ? 'Report finale generato - Salva o pulisci chat'
                  : 'Completa o annulla prima di fare altro'}
              </p>
              <p className="text-xs opacity-75 mt-2">
                Step: {currentStep.replace(/_/g, ' ')}
              </p>
            </div>
            {/* 🔴 TALIBAN: Hide exit button after Q7 */}
            {!isTalibanLocked && (
              <button
                onClick={handleExit}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Annulla Assessment"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={32} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Conferma uscita
                </h3>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Sei sicuro di voler annullare il Risk Assessment?
              </p>

              <p className="text-red-600 dark:text-red-400 font-bold mb-6">
                ⚠️ Perderai tutti i progressi fatti finora!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sì, annulla tutto
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Continua assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProcessIndicator;