import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useStore';
import { useMessages } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Shield,
  Brain,
  PlayCircle
} from 'lucide-react';
import ATECOAutocomplete from './ATECOAutocomplete';
import { useATECO } from '../../hooks/useATECO';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import toast from 'react-hot-toast';

// Import dei componenti per le azioni
import SydAgentPanel from '../sydAgent/SydAgentPanel';
import { VideoPresentation } from '../presentation/VideoPresentation';

const SessionPanel: React.FC = () => {
  const sessionMeta = useAppStore((state) => state.sessionMeta);
  const setSessionMeta = useAppStore((state) => state.setSessionMeta);
  const setShowRiskReport = useAppStore((state) => state.setShowRiskReport);
  const messages = useMessages();

  const [showAtecoDetails, setShowAtecoDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRiskLoading, setIsRiskLoading] = useState(false);
  const [showSydAgent, setShowSydAgent] = useState(false);
  const [showVideoPresentation, setShowVideoPresentation] = useState(false);

  const { processATECO } = useATECO();
  const { startRiskFlow } = useRiskFlow();

  const hasRiskData = messages && Array.isArray(messages) && messages.some(m =>
    m.type === 'assessment-complete' ||
    m.type === 'risk-report'
  );

  const handleImpostaAteco = useCallback(async () => {
    if (!sessionMeta.ateco || isLoading) return;
    setIsLoading(true);
    try {
      await processATECO();
    } finally {
      setIsLoading(false);
    }
  }, [sessionMeta.ateco, isLoading, processATECO]);

  const handleGenerateReport = useCallback(() => {
    if (!hasRiskData) return;

    setShowRiskReport(true);
    toast.success('📊 Report Risk Management visualizzato!');
  }, [hasRiskData, setShowRiskReport]);

  return (
    <>
      <div className="h-full flex flex-col bg-card-light dark:bg-card-dark rounded-2xl shadow-lg">
        {/* Header fisso sempre visibile */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-lg flex items-center gap-2">
            📊 Pannello Controllo
          </h2>
        </div>

        {/* Contenuto principale con layout responsive */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Container scrollabile se necessario */}
          <div className="flex-1 overflow-y-auto">
            {/* SEZIONE ATECO - Natural flow, no fixed margins */}
            <div className="p-4 space-y-3">
              {/* Campo ATECO */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Codice ATECO
                </label>
                <ATECOAutocomplete
                  value={sessionMeta.ateco || ''}
                  onChange={(value) => setSessionMeta({ ...sessionMeta, ateco: value })}
                  className="w-full"
                  dropdownClassName="max-h-40"
                />
              </div>

              {/* Preview dati ATECO - si espande naturalmente */}
              <AnimatePresence>
                {sessionMeta.atecoDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {sessionMeta.atecoDescription}
                    </p>
                    {(sessionMeta.settore || sessionMeta.normative) && (
                      <button
                        onClick={() => setShowAtecoDetails(!showAtecoDetails)}
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                      >
                        {showAtecoDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {showAtecoDetails ? 'Nascondi' : 'Mostra'} dettagli
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dettagli espansi - push content naturally */}
              <AnimatePresence>
                {showAtecoDetails && sessionMeta.atecoDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs space-y-1 px-2 overflow-y-auto max-h-24"
                  >
                    {sessionMeta.settore && (
                      <p><span className="font-medium">Settore:</span> {sessionMeta.settore}</p>
                    )}
                    {sessionMeta.normative && (
                      <p><span className="font-medium">Normative:</span> {sessionMeta.normative}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SEZIONE 1: Bottoni Workflow - Natural spacing */}
              <div className="pt-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Workflow
                </h3>

                {/* Bottone Analizza ATECO */}
                <motion.button
                  onClick={handleImpostaAteco}
                  disabled={isLoading || !sessionMeta.ateco}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Sparkles size={14} />
                  <span>Analizza ATECO</span>
                </motion.button>

                {/* Bottone Risk Report */}
                <motion.button
                  onClick={handleGenerateReport}
                  disabled={!hasRiskData}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <FileText size={14} />
                  <span>Risk Report</span>
                </motion.button>

                {/* Bottone Risk Management */}
                <motion.button
                  onClick={async () => {
                    setIsRiskLoading(true);
                    await startRiskFlow();
                    setIsRiskLoading(false);
                  }}
                  disabled={isRiskLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Shield size={14} />
                  <span>Risk Management</span>
                </motion.button>
              </div>

              {/* SEZIONE 2: Assistenti - Natural spacing */}
              <div className="pt-4 space-y-2 pb-4">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assistenti Virtuali
                </h3>

                {/* Bottone SYD Agent */}
                <motion.button
                  onClick={() => setShowSydAgent(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all duration-300 animate-pulse hover:animate-none"
                >
                  <Brain size={14} />
                  <span>SYD Agent</span>
                </motion.button>

                {/* Bottone Video Presentazione */}
                <motion.button
                  onClick={() => setShowVideoPresentation(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all duration-300 animate-pulse hover:animate-none"
                >
                  <PlayCircle size={14} />
                  <span>Video Presentazione</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Componenti modali/panel che si aprono */}
      {showSydAgent && (
        <SydAgentPanel
          isOpen={showSydAgent}
          onClose={() => setShowSydAgent(false)}
        />
      )}

      {showVideoPresentation && (
        <VideoPresentation
          isOpen={showVideoPresentation}
          onClose={() => setShowVideoPresentation(false)}
        />
      )}
    </>
  );
};

export default SessionPanel;