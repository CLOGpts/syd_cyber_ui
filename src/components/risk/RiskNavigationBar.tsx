import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface RiskNavigationBarProps {
  currentStep: string;
  canGoBack: boolean;
  onBack: () => void;
  onNext?: () => void;
  onReset: () => void;
  progress: number; // 0-100
  stepLabel: string;
}

const RiskNavigationBar: React.FC<RiskNavigationBarProps> = ({
  currentStep,
  canGoBack,
  onBack,
  onNext,
  onReset,
  progress,
  stepLabel
}) => {
  return (
    <>
      {/* Freccia Indietro - Lato Sinistro */}
      {canGoBack && (
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={onBack}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-sky-500/50 backdrop-blur-sm"
          title="Indietro (ESC)"
        >
          <ChevronLeft size={28} strokeWidth={3} />
        </motion.button>
      )}

      {/* Freccia Avanti - Lato Destro (se necessario) */}
      {onNext && (
        <motion.button
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={onNext}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-sky-500/50 backdrop-blur-sm"
          title="Avanti (ENTER)"
        >
          <ChevronRight size={28} strokeWidth={3} />
        </motion.button>
      )}

      {/* Progress Bar Sottile in Alto */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-[72px] left-0 right-0 z-40"
      >
        <div className="relative h-1 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-800/50 dark:to-gray-900/50">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 shadow-lg shadow-sky-500/30"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* Step Label Floating - Top Center */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <motion.div
          key={stepLabel}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent"
        >
          {stepLabel}
        </motion.div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5">
          {Math.round(progress)}%
        </div>
      </motion.div>

      {/* Reset Button - Bottom Right */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15, rotate: -180 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onReset}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-red-500/20 backdrop-blur-sm border border-white/20 hover:border-red-500/50 text-gray-600 dark:text-gray-400 hover:text-red-500 shadow-xl transition-colors"
        title="Ricomincia da capo"
      >
        <RotateCcw size={20} />
      </motion.button>
    </>
  );
};

export default RiskNavigationBar;
