import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, FileText, RefreshCw, Shuffle, LogOut } from 'lucide-react';

interface AssessmentCompleteCardProps {
  riskScore: number;
  riskLevel: string;
  analysis: string;
  onGenerateReport: () => void;
  onAnotherEvent: () => void;
  onChangeCategory: () => void;
  onEndSession: () => void;
  isDarkMode?: boolean;
}

const AssessmentCompleteCard: React.FC<AssessmentCompleteCardProps> = ({
  riskScore,
  riskLevel,
  analysis,
  onGenerateReport,
  onAnotherEvent,
  onChangeCategory,
  onEndSession,
  isDarkMode = false
}) => {

  const getRiskColor = () => {
    if (riskScore >= 75) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
    if (riskScore >= 50) return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
    if (riskScore >= 25) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
    return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
  };

  const colors = getRiskColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl`}>
        
        {/* Header con successo */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              VALUTAZIONE COMPLETATA CON SUCCESSO!
            </h3>
          </div>
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Risk Score e Analisi */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={`w-5 h-5 ${colors.text}`} />
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Risk Score: {riskScore}/100
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-3 py-1 rounded-full ${colors.bg} text-white text-sm font-medium`}>
              {riskLevel}
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Score: {riskScore}/100 - Priorità alta, pianificare mitigazione
            </span>
          </div>
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Report Section */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚀</span>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              REPORT SPETTACOLARE PRONTO!
            </h3>
          </div>
          <div className="mb-4">
            <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              👉 Digita "genera report" o "report" per visualizzare
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              la matrice di rischio interattiva con effetto WOW!
            </p>
          </div>
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Altre Opzioni */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-bold mb-3 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Altre opzioni:
          </h3>
          <div className="space-y-2">
            <button
              onClick={onAnotherEvent}
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              • <strong>"altro"</strong> → Valuta un altro evento
            </button>
            <br />
            <button
              onClick={onChangeCategory}
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              • <strong>"cambia"</strong> → Cambia categoria
            </button>
            <br />
            <button
              onClick={onEndSession}
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              • <strong>"fine"</strong> → Termina sessione
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentCompleteCard;