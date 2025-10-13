import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, ChevronRight } from 'lucide-react';

interface RiskDescriptionCardProps {
  eventCode: string;
  eventName: string;
  category: string;
  severity: string;
  description: string;
  impact?: string;
  controls?: string;
  onContinue: () => void;
  onGoBack?: () => void;
  isDarkMode?: boolean;
}

const RiskDescriptionCard: React.FC<RiskDescriptionCardProps> = ({
  eventCode,
  eventName,
  category,
  severity,
  description,
  impact = 'Significativo',
  controls = 'Standard',
  onContinue,
  onGoBack,
  isDarkMode = false
}) => {
  const getSeverityColor = () => {
    // Usa sempre palette blu/sky per coerenza
    switch(severity.toLowerCase()) {
      case 'critical': return { bg: 'bg-sky-600', text: 'text-sky-600', light: 'bg-sky-50' };
      case 'high': return { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' };
      case 'medium': return { bg: 'bg-sky-500', text: 'text-sky-500', light: 'bg-sky-50' };
      case 'low': return { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-50' };
    }
  };

  const colors = getSeverityColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-3 sm:px-4 lg:px-6"
    >
      {/* Main Card */}
      <div className="rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20">
        
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-sky-500/20 bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colors.bg} text-white`}>
                  #{eventCode}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-gray-300">
                  {category}
                </span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-white">
                {eventName}
              </h3>
              <p className="text-sm text-gray-400">
                Analisi rischio completata • {new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
            <AlertTriangle className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${colors.text}`} />
          </div>
        </div>

        {/* Description */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-sky-500/20 bg-slate-900/50">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-sky-300">
            Descrizione Dettagliata
          </h4>
          <p className="text-sm sm:text-base leading-relaxed text-gray-300">
            {description}
          </p>
        </div>

        {/* Metrics Grid - Solo Impatto e Controlli */}
        <div className="p-4 sm:p-5 lg:p-6 bg-slate-900/30">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-sky-300">
            Metriche di Rischio
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Impact */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-slate-800/50 border border-sky-500/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-400">
                  Impatto
                </span>
              </div>
              <p className="text-xl font-bold text-white">
                {impact}
              </p>
            </motion.div>

            {/* Controls */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-slate-800/50 border border-sky-500/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-400">
                  Controlli
                </span>
              </div>
              <p className="text-xl font-bold text-white">
                {controls}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 sm:p-5 lg:p-6 border-t border-sky-500/20 bg-slate-800/30">
          <div className="flex items-center justify-between gap-4">
            {/* Bottone Indietro */}
            {onGoBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoBack}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gray-700 hover:bg-gray-600 text-white"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">Indietro</span>
              </motion.button>
            )}

            {/* Testo centrale */}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Pronto per la valutazione di rischio operativo?
              </p>
              <p className="text-xs text-gray-400">
                Ti farò alcune domande per valutare l'impatto di questo rischio
              </p>
            </div>

            {/* Bottone Continua */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-sky-600 to-blue-600 hover:shadow-lg hover:shadow-sky-500/30 text-white"
            >
              <span className="hidden sm:inline">Inizia Assessment</span>
              <span className="sm:hidden">Avanti</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskDescriptionCard;