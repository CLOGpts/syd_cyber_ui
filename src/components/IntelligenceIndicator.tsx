import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useIntelligenceStore } from '../hooks/useVisuraIntelligence';

interface IntelligenceIndicatorProps {
  show?: boolean;
  result?: any;
}

const IntelligenceIndicator: React.FC<IntelligenceIndicatorProps> = ({ show = false, result }) => {
  const [isVisible, setIsVisible] = useState(false);
  const stats = useIntelligenceStore((state) => state.stats);
  const corrections = useIntelligenceStore((state) => state.corrections);
  
  useEffect(() => {
    if (show && result?.intelligence) {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 8000);
    }
  }, [show, result]);
  
  if (!result?.intelligence) return null;
  
  const { intelligence } = result;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-1 rounded-2xl shadow-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4">
              
              {/* Header con animazione */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Brain className="w-8 h-8 text-purple-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Visura Intelligence System
                  </h3>
                  <p className="text-xs text-gray-500">AI-Powered Data Enhancement</p>
                </div>
              </div>
              
              {/* Confidence Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="font-bold text-green-600">
                    {Math.round(intelligence.finalConfidence * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: `${intelligence.originalConfidence * 100}%` }}
                    animate={{ width: `${intelligence.finalConfidence * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Before: {Math.round(intelligence.originalConfidence * 100)}%</span>
                  <span>After: {Math.round(intelligence.finalConfidence * 100)}%</span>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Correzioni applicate */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Auto-Corrections</p>
                      <p className="text-lg font-bold text-blue-600">
                        {intelligence.correctionsApplied}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* AI Fields Used */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">AI Fields</p>
                      <p className="text-lg font-bold text-purple-600">
                        {intelligence.aiFieldsUsed}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Cost Saved */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Cost Saved</p>
                      <p className="text-lg font-bold text-green-600">
                        €{intelligence.costSaved.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Learning Progress */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Patterns Learned</p>
                      <p className="text-lg font-bold text-cyan-600">
                        {intelligence.learningProgress}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Corrections Applied */}
              {intelligence.correctionsApplied > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Automatic Corrections Applied:
                  </p>
                  <div className="space-y-1">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Province: LE → TO (Bosconero)
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        REA: Added province prefix
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Business Type: B2C → B2B (ATECO 62.01)
                      </span>
                    </motion.div>
                  </div>
                </div>
              )}
              
              {/* AI Chirurgica Fields */}
              {intelligence.aiFieldsUsed > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    💉 AI Chirurgica Applied:
                  </p>
                  <div className="space-y-1">
                    {intelligence.aiFields?.includes('amministratori') && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Administrators extracted via AI
                        </span>
                      </motion.div>
                    )}
                    {intelligence.aiFields?.includes('oggetto_sociale') && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Business purpose completed via AI
                        </span>
                      </motion.div>
                    )}
                    {intelligence.aiFields?.includes('telefono') && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Phone number extracted via AI
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Footer Stats */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span>Total Extractions: </span>
                    <span className="font-bold">{stats.totalExtractions}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>System Accuracy: </span>
                    <span className="font-bold text-green-600">
                      {Math.round(stats.backendAccuracy * 100)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-center text-gray-500">
                    Total Saved: <span className="font-bold text-green-600">€{stats.savedCosts.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Animated Background Effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400 rounded-2xl blur-xl" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntelligenceIndicator;