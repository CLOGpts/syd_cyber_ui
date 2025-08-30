import React from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { generateReport } from '../../api/report';
import { useTranslations } from '../../hooks/useTranslations';
import { useATECO } from '../../hooks/useATECO';
import ATECOAutocomplete from './ATECOAutocomplete';
import VisuraExtractionIndicator from './VisuraExtractionIndicator';
import type { SessionMeta } from '../../types';

const SessionPanel: React.FC = () => {
  const { sessionMeta, updateSessionMeta } = useAppStore();
  const t = useTranslations();
  const { processATECO, isLoading } = useATECO();

  const handleGenerateReport = async () => {
    const toastId = toast.loading('Generating report...');
    const result = await generateReport(sessionMeta);
    if (result.success) {
      toast.success(t.reportGenerated, { id: toastId });
    } else {
      toast.error('Failed to generate report.', { id: toastId });
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
    <div className="p-4 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg space-y-4">
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

      {/* Mostra dati arricchiti nel pannello con animazioni */}
      <AnimatePresence>
        {(sessionMeta.settore || sessionMeta.normative || sessionMeta.certificazioni) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 space-y-2"
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

      <div className="flex gap-3 mt-6">
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
          disabled={!sessionMeta.ateco}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed relative overflow-hidden group"
          whileHover={{ scale: !sessionMeta.ateco ? 1 : 1.03 }}
          whileTap={{ scale: !sessionMeta.ateco ? 1 : 0.97 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            📄 Genera Report
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default SessionPanel;
