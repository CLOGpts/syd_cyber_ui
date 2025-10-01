import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, RefreshCw } from 'lucide-react';

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
    // Usa sempre palette blu/sky per coerenza
    if (riskScore >= 75) return { bg: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-600' };
    if (riskScore >= 50) return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600' };
    if (riskScore >= 25) return { bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500' };
    return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
  };

  const colors = getRiskColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-3 sm:px-4 lg:px-6"
    >
      <div className="rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20">

        {/* Header pulito */}
        <div className="px-6 py-5 bg-slate-800/50 border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-bold text-white">
              Report Pronto
            </h3>
          </div>
        </div>

        {/* Messaggio principale */}
        <div className="px-6 py-6 bg-slate-900/50">
          <p className="text-base text-gray-300 mb-4">
            La valutazione del rischio è stata completata con successo.
          </p>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-sky-500/10">
            <div className={`px-3 py-1 rounded-full ${colors.bg} text-white text-sm font-medium`}>
              {riskLevel}
            </div>
            <span className="text-sm text-gray-300">
              Risk Score: <strong className="text-white">{riskScore}/100</strong>
            </span>
          </div>
        </div>

        {/* Azioni principali */}
        <div className="px-6 py-5 bg-slate-800/30 border-t border-sky-500/20">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Bottone Visualizza Report (primario) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGenerateReport}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all bg-gradient-to-r from-sky-600 to-blue-600 hover:shadow-lg hover:shadow-sky-500/30 text-white"
            >
              <FileText className="w-5 h-5" />
              <span>Visualizza Report</span>
            </motion.button>

            {/* Bottone Nuova Valutazione (secondario) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEndSession}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all bg-gray-700 hover:bg-gray-600 text-white"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Nuova Valutazione</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentCompleteCard;