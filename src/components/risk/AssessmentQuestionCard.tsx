import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Hash } from 'lucide-react';

interface AssessmentQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  fieldName: string;
  onAnswer: (answer: string) => void;
  isDarkMode?: boolean;
}

const AssessmentQuestionCard: React.FC<AssessmentQuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  fieldName,
  onAnswer,
  isDarkMode = false
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    // Invia automaticamente la risposta dopo selezione
    setTimeout(() => {
      onAnswer((index + 1).toString());
    }, 300);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      const num = parseInt(inputValue);
      if (num >= 1 && num <= options.length) {
        setSelectedOption(num - 1);
        setTimeout(() => {
          onAnswer(inputValue);
          setInputValue('');
        }, 300);
      }
    }
  };

  // Progress bar calculation
  const progress = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Main Card */}
      <div className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800/60' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Header with Progress */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Domanda {questionNumber} di {totalQuestions}
              </span>
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {Math.round(progress)}% completato
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>

          {/* Question */}
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {question}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Seleziona una delle opzioni seguenti
              </p>
            </div>
          </div>
        </div>

        {/* Options List - Spotify Style */}
        <div className={`${
          isDarkMode ? 'bg-gray-800/40' : 'bg-gray-50/50'
        }`}>
          <div className="p-4">
            {options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOptionClick(index)}
                onMouseEnter={() => setHoveredOption(index)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  mb-2 p-4 rounded-xl cursor-pointer transition-all duration-200
                  ${selectedOption === index
                    ? isDarkMode 
                      ? 'bg-blue-600/20 border-2 border-blue-500' 
                      : 'bg-blue-50 border-2 border-blue-500'
                    : isDarkMode
                      ? hoveredOption === index 
                        ? 'bg-gray-700/50 border-2 border-gray-600' 
                        : 'bg-gray-700/30 border-2 border-transparent'
                      : hoveredOption === index
                        ? 'bg-white border-2 border-gray-300'
                        : 'bg-white border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`
                      flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm
                      ${selectedOption === index
                        ? 'bg-blue-500 text-white'
                        : hoveredOption === index
                          ? isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }
                    `}>
                      {index + 1}
                    </span>
                    <span className={`text-sm ${
                      selectedOption === index
                        ? isDarkMode ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium'
                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                  <AnimatePresence>
                    {(hoveredOption === index || selectedOption === index) && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <ChevronRight className={`w-4 h-4 ${
                          selectedOption === index ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer with Input */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Numeric Input - Blue Style like Events */}
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 border-2 border-blue-400 rounded-lg px-3 py-2">
                <Hash size={16} className="text-blue-600 dark:text-blue-300 flex-shrink-0" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputSubmit}
                  placeholder={`1-${options.length}`}
                  className="w-16 bg-transparent focus:outline-none text-sm font-mono text-blue-700 dark:text-blue-200 placeholder-blue-400"
                />
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Digita il numero o clicca sull'opzione
              </span>
            </div>
            
            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-green-500"
              >
                <span>Opzione {selectedOption + 1} selezionata</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentQuestionCard;