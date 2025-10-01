import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardStepProps {
  children: React.ReactNode;
  stepKey: string; // Unique key for animation
  isDarkMode?: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({
  children,
  stepKey,
  isDarkMode = false
}) => {
  const fadeVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full h-full flex items-center justify-center p-6"
      >
        <div className={`
          w-full max-w-4xl
          ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}
          backdrop-blur-sm
          rounded-2xl
          shadow-2xl
          p-8
        `}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WizardStep;
