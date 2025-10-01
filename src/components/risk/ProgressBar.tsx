import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  isDarkMode?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  isDarkMode = false
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-6 py-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Step {currentStep} of {totalSteps}
        </span>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Progress bar track */}
      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step labels (optional) */}
      {stepLabels.length > 0 && (
        <div className="flex justify-between mt-2">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={`text-xs ${
                index + 1 <= currentStep
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
