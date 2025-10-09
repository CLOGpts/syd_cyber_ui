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

        {/* Sezione educativa Risk Management */}
        <div className="px-6 py-6 bg-slate-900/50 border-t border-sky-500/20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Titolo */}
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              🛡️ Che cos'è il Risk Management in azienda
            </h4>

            {/* Sottotitolo */}
            <p className="text-sm font-semibold text-sky-400 mb-4">
              Caratteristiche e vantaggi dell'analisi di gestione dei rischi
            </p>

            {/* Contenuto principale */}
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                Il <em className="text-sky-400 font-medium">Risk Management</em> (o gestione dei rischi) è il processo attraverso il quale un'azienda
                identifica, valuta e controlla i rischi che possono influire sul raggiungimento dei propri obiettivi.
              </p>

              <p>
                Sebbene non sia possibile eliminare completamente i rischi, la loro analisi e gestione consente
                di adottare strategie e comportamenti adeguati per ridurne l'impatto o, in alcuni casi, creare del
                valore economico e trasformarli in opportunità di miglioramento.
              </p>

              <p>
                <strong className="text-white">SYD</strong> è uno strumento progettato per supportare l'imprenditore nell'analisi autonoma
                dei rischi della propria organizzazione, guidandolo in un percorso strutturato e intuitivo.
                Il risultato del processo di valutazione è un <em className="text-sky-400 font-medium">Report di Analisi dei Rischi</em>, che evidenzia
                le principali aree di vulnerabilità e propone azioni di controllo, prevenzione o mitigazione.
              </p>
            </div>

            {/* Matrice strategie di gestione del rischio */}
            <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-sky-500/20">
              <p className="text-sm font-bold text-white mb-3 text-center">
                Il Rischio si valuta e si può:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-4 py-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center">
                  <span className="text-sm font-semibold text-amber-400">Evitare</span>
                </div>
                <div className="px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-center">
                  <span className="text-sm font-semibold text-emerald-400">Ridurre</span>
                </div>
                <div className="px-4 py-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center">
                  <span className="text-sm font-semibold text-amber-400">Trasferire</span>
                </div>
                <div className="px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-center">
                  <span className="text-sm font-semibold text-emerald-400">Accettare</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentCompleteCard;