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
        
        {/* Header con successo */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              VALUTAZIONE COMPLETATA CON SUCCESSO!
            </h3>
          </div>
          <div className="border-b border-sky-500/20" />
        </div>

        {/* Risk Score e Analisi */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={`w-5 h-5 ${colors.text}`} />
            <span className="text-lg font-bold text-white">
              Risk Score: {riskScore}/100
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-3 py-1 rounded-full ${colors.bg} text-white text-sm font-medium`}>
              {riskLevel}
            </div>
            <span className="text-sm text-gray-300">
              Score: {riskScore}/100 - Priorità alta, pianificare mitigazione
            </span>
          </div>
          <div className="border-b border-sky-500/20" />
        </div>

        {/* Report Section */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚀</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              REPORT SPETTACOLARE PRONTO!
            </h3>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-white">
              👉 Digita "genera report" o "report" per visualizzare
            </p>
            <p className="text-sm text-gray-300">
              la matrice di rischio interattiva con effetto WOW!
            </p>
          </div>
          <div className="border-b border-sky-500/20" />
        </div>

        {/* Altre Opzioni */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-800/30">
          <h3 className="text-sm font-bold mb-3 text-gray-400">
            Altre opzioni:
          </h3>
          <div className="space-y-2">
            <button
              onClick={onAnotherEvent}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              • <strong>"altro"</strong> → Valuta un altro evento
            </button>
            <br />
            <button
              onClick={onChangeCategory}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              • <strong>"cambia"</strong> → Cambia categoria
            </button>
            <br />
            <button
              onClick={onEndSession}
              className="text-sm text-gray-300 hover:text-white transition-colors"
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