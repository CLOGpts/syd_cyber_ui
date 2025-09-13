import React from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { useChatStore, useRiskAssessmentData, chatStore } from '../../store';
import { generateReport } from '../../api/report';
import { useTranslations } from '../../hooks/useTranslations';
import { useATECO } from '../../hooks/useATECO';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import ATECOAutocomplete from './ATECOAutocomplete';
import VisuraExtractionIndicator from './VisuraExtractionIndicator';
import type { SessionMeta } from '../../types';

const SessionPanel: React.FC = () => {
  const { sessionMeta, updateSessionMeta } = useAppStore();
  const t = useTranslations();
  const { processATECO, isLoading } = useATECO();
  const { startRiskFlow } = useRiskFlow();
  const [isRiskLoading, setIsRiskLoading] = React.useState(false);
  const [showAtecoDetails, setShowAtecoDetails] = React.useState(false);
  
  // Verifica se abbiamo dati del risk assessment
  const { riskAssessmentData } = chatStore.getState();
  const hasRiskData = riskAssessmentData && riskAssessmentData.perdita_economica;

  const handleGenerateReport = async () => {
    // Se abbiamo dati del risk assessment, mostra il Risk Report
    const { riskAssessmentData } = chatStore.getState();
    if (riskAssessmentData && riskAssessmentData.perdita_economica) {
      // Mostra il Risk Report spettacolare!
      useAppStore.getState().setShowRiskReport(true);
    } else {
      // Altrimenti genera il report normale
      const toastId = toast.loading('Generazione report in corso...');
      const result = await generateReport(sessionMeta);
      if (result.success) {
        toast.success(`Report generato con successo! Il download dovrebbe partire automaticamente.`, { id: toastId });
      } else {
        toast.error('Errore nella generazione del report.', { id: toastId });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateSessionMeta({ [e.target.name as keyof SessionMeta]: e.target.value });
  };

  const handleImpostaAteco = async (code?: string) => {
    // Se viene passato un codice dall'autocomplete, usalo. Altrimenti usa quello nel sessionMeta
    const atecoToProcess = code || sessionMeta.ateco;
    console.log('🎯 SessionPanel handleImpostaAteco chiamato con:', { 
      codeParam: code, 
      sessionMetaAteco: sessionMeta.ateco,
      atecoToProcess 
    });
    
    if (!atecoToProcess || atecoToProcess.trim() === '') {
      toast.error('Inserisci prima un codice ATECO');
      return;
    }
    
    await processATECO(atecoToProcess);
  };

  return (
    <div className="p-4 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg space-y-3 max-w-full overflow-hidden">
      <h2 className="font-bold text-lg">📊 Sessione Report</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-text-muted-light dark:text-text-muted-dark">
            Codice ATECO
          </label>
          <ATECOAutocomplete
            value={sessionMeta.ateco || ''}
            onChange={(value) => updateSessionMeta({ ateco: value })}
            onSelect={handleImpostaAteco}
            placeholder="Es: 62.01.00 - Software..."
          />
        </div>
      </div>

      {/* Mostra dati arricchiti nel pannello con animazioni e toggle */}
      {(sessionMeta.settore || sessionMeta.normative || sessionMeta.certificazioni) && (
        <div className="mt-4 mb-2">
          <button
            onClick={() => setShowAtecoDetails(!showAtecoDetails)}
            className="w-full flex items-center justify-between px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              📊 Dettagli ATECO
            </span>
            <motion.span
              animate={{ rotate: showAtecoDetails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-blue-700 dark:text-blue-400"
            >
              ▼
            </motion.span>
          </button>
          
          <AnimatePresence mode="wait">
            {showAtecoDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto"
              >
            {sessionMeta.settore && (
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm"
              >
                <span className="font-semibold text-blue-700 dark:text-blue-400">Settore:</span> 
                <span className="text-slate-700 dark:text-slate-300 ml-2">{sessionMeta.settore}</span>
              </motion.p>
            )}
            {sessionMeta.normative && (
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm"
              >
                <span className="font-semibold text-purple-700 dark:text-purple-400">Normative:</span>
                <span className="text-slate-700 dark:text-slate-300 ml-2">{sessionMeta.normative}</span>
              </motion.p>
            )}
            {sessionMeta.certificazioni && (
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm"
              >
                <span className="font-semibold text-teal-700 dark:text-teal-400">Certificazioni:</span>
                <span className="text-slate-700 dark:text-slate-300 ml-2">{sessionMeta.certificazioni}</span>
              </motion.p>
            )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3">
          <motion.button
            onClick={() => handleImpostaAteco()}
            disabled={isLoading || !sessionMeta.ateco}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed relative overflow-hidden group"
            whileHover={{ scale: isLoading || !sessionMeta.ateco ? 1 : 1.03 }}
            whileTap={{ scale: isLoading || !sessionMeta.ateco ? 1 : 0.97 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          >
            {isLoading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Analizzando...
                </>
              ) : (
                <>
                  🔍 Analizza ATECO
                </>
              )}
            </span>
          </motion.button>

          <motion.button
            onClick={handleGenerateReport}
            disabled={!sessionMeta.ateco && !hasRiskData}
            className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 relative overflow-hidden group ${
              hasRiskData 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed`}
            whileHover={{ scale: (!sessionMeta.ateco && !hasRiskData) ? 1 : 1.03 }}
            whileTap={{ scale: (!sessionMeta.ateco && !hasRiskData) ? 1 : 0.97 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {hasRiskData ? '🚀 Mostra Risk Report' : '📄 Genera Report'}
            </span>
          </motion.button>
        </div>

        <motion.button
          onClick={async () => {
            console.log('🔴 PULSANTE RISK MANAGEMENT CLICCATO!');
            setIsRiskLoading(true);
            await startRiskFlow();
            setIsRiskLoading(false);
          }}
          disabled={isRiskLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-orange-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed relative overflow-hidden group"
          whileHover={{ scale: isRiskLoading ? 1 : 1.03 }}
          whileTap={{ scale: isRiskLoading ? 1 : 0.97 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          {isRiskLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isRiskLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Caricamento...
              </>
            ) : (
              <>
                🛡️ Risk Management
              </>
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default SessionPanel;
