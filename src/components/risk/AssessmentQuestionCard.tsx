import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Hash, ChevronLeft, Check, Edit2 } from 'lucide-react';

interface AssessmentQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  fieldName: string;
  onAnswer: (answer: string) => void;
  isDarkMode?: boolean;
  // NUOVO: Stato risposta per inline edit
  isAnswered?: boolean;
  currentAnswer?: string;
  onEditAnswer?: (newAnswer: string) => void;
  // NUOVO: Navigation
  onGoBack?: () => void;
}

const AssessmentQuestionCard: React.FC<AssessmentQuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  fieldName,
  onAnswer,
  isDarkMode = false,
  isAnswered = false,
  currentAnswer = '',
  onEditAnswer,
  onGoBack
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewValue, setPreviewValue] = useState('');
  const [isEditing, setIsEditing] = useState(!isAnswered); // Auto-edit mode se non risposta

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setPreviewValue(options[index]);
    setShowPreview(true);
  };

  const confirmAnswer = () => {
    if (selectedOption !== null) {
      const answerValue = (selectedOption + 1).toString();

      // Se siamo in edit mode, usa onEditAnswer
      if (isAnswered && isEditing && onEditAnswer) {
        onEditAnswer(answerValue);
        setIsEditing(false);
      } else {
        // Altrimenti usa onAnswer normale
        onAnswer(answerValue);
      }

      setShowPreview(false);
      setSelectedOption(null);
    }
  };

  const editAnswer = () => {
    setShowPreview(false);
    setSelectedOption(null);
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

  // SE GIÀ RISPOSTA - MODALITÀ COMPATTA CON EDIT
  if (isAnswered && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-3 sm:px-4 lg:px-6 relative"
      >
        <div className="rounded-lg bg-slate-800/30 border border-green-500/30 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-400">Domanda {questionNumber}/{totalQuestions}</span>
                <p className="text-sm font-medium text-white mt-1">{question}</p>
                <p className="text-sm text-green-300 mt-2">
                  ✓ Risposta: {options[parseInt(currentAnswer) - 1] || currentAnswer}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>Modifica</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-3 sm:px-4 lg:px-6 relative"
    >
      {/* Main Card */}
      <div className="rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20">
        
        {/* Header with Progress */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-sky-500/20 bg-slate-800/50">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-400">
                Domanda {questionNumber} di {totalQuestions}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-400">
                <span className="hidden sm:inline">{Math.round(progress)}% completato</span>
                <span className="sm:hidden">{Math.round(progress)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
              />
            </div>
          </div>

          {/* Question */}
          <div className="flex items-start gap-2 sm:gap-3">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 text-white">
                {question}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Seleziona una delle opzioni seguenti
              </p>
            </div>
          </div>
        </div>

        {/* Options List - Spotify Style */}
        <div className="bg-slate-900/50">
          <div className="p-3 sm:p-4">
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
                  mb-2 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200
                  ${selectedOption === index
                    ? 'bg-sky-600/20 border-2 border-sky-500'
                    : hoveredOption === index
                      ? 'bg-slate-800/50 border-2 border-slate-600'
                      : 'bg-slate-800/30 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`
                      flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs sm:text-sm
                      ${selectedOption === index
                        ? 'bg-sky-500 text-white'
                        : hoveredOption === index
                          ? isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }
                    `}>
                      {index + 1}
                    </span>
                    <span className={`text-xs sm:text-sm ${
                      selectedOption === index
                        ? 'text-sky-300 font-medium'
                        : 'text-gray-300'
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
                        <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          selectedOption === index ? 'text-sky-500' : 'text-gray-400'
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
        <div className="p-3 sm:p-4 lg:p-6 border-t border-sky-500/20 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back Button - Con handler sicuro */}
              {questionNumber > 1 && onGoBack && (
                <button
                  onClick={() => {
                    console.log('🔙 Back clicked for Q', questionNumber);
                    if (onGoBack) onGoBack();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs sm:text-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Indietro</span>
                </button>
              )}

              {/* Numeric Input - Blue Style like Events */}
              <div className="flex items-center gap-2 bg-sky-100 dark:bg-sky-900/30 border-2 border-sky-400 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <Hash size={14} className="text-sky-600 dark:text-sky-300 flex-shrink-0 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputSubmit}
                  placeholder={`1-${options.length}`}
                  className="w-12 sm:w-16 bg-transparent focus:outline-none text-xs sm:text-sm font-mono text-sky-700 dark:text-sky-200 placeholder-sky-400"
                />
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="hidden sm:inline">Digita il numero o clicca sull'opzione</span>
                <span className="sm:hidden">Scegli</span>
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

      {/* Preview Overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl border-2 border-sky-500/30"
            >
              <div className="text-center mb-4">
                <div className="text-sky-400 font-semibold mb-2">Conferma risposta</div>
                <div className="text-white text-lg font-medium">{previewValue}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmAnswer}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  <span>Conferma</span>
                </button>
                <button
                  onClick={editAnswer}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Modifica</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssessmentQuestionCard;