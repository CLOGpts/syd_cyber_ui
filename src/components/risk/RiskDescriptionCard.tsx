import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Activity, ChevronRight } from 'lucide-react';

interface RiskDescriptionCardProps {
  eventCode: string;
  eventName: string;
  category: string;
  severity: string;
  description: string;
  probability?: string;
  impact?: string;
  controls?: string;
  monitoring?: string;
  onContinue: () => void;
  isDarkMode?: boolean;
}

const RiskDescriptionCard: React.FC<RiskDescriptionCardProps> = ({
  eventCode,
  eventName,
  category,
  severity,
  description,
  probability = 'Media',
  impact = 'Significativo',
  controls = 'Standard',
  monitoring = 'Trimestrale',
  onContinue,
  isDarkMode = false
}) => {
  const getSeverityColor = () => {
    switch(severity.toLowerCase()) {
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' };
      case 'high': return { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-50' };
      case 'low': return { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-50' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-50' };
    }
  };

  const colors = getSeverityColor();

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
        
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colors.bg} text-white`}>
                  #{eventCode}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {category}
                </span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {eventName}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Analisi rischio completata • {new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${colors.text}`} />
          </div>
        </div>

        {/* Description */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Descrizione Dettagliata
          </h4>
          <p className={`text-base leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {description}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="p-6">
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Metriche di Rischio
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Probability */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Probabilità
                </span>
              </div>
              <p className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {probability}
              </p>
            </motion.div>

            {/* Impact */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Impatto
                </span>
              </div>
              <p className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {impact}
              </p>
            </motion.div>

            {/* Controls */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Controlli
                </span>
              </div>
              <p className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {controls}
              </p>
            </motion.div>

            {/* Monitoring */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Monitoraggio
                </span>
              </div>
              <p className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {monitoring}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Continue Button */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Pronto per la valutazione finanziaria?
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ti farò 5 domande per valutare l'impatto di questo rischio
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Inizia Assessment
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskDescriptionCard;