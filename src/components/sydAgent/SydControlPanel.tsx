import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Send,
  ChevronRight,
  Lightbulb,
  Zap,
  Command,
  Info,
  TrendingUp
} from 'lucide-react';
import { useMessages, useRiskFlowStep, useCurrentStepDetails } from '../../store';
import { chatStore } from '../../store/chatStore';
import { useAppStore } from '../../store/useStore';
import { getSectorKnowledge } from '../../data/sectorKnowledge';

interface SydControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SydControlPanel: React.FC<SydControlPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'smart' | 'actions' | 'commands'>('smart');

  // Real-time state sync
  const messages = useMessages();
  const riskFlowStep = useRiskFlowStep();
  const currentStepDetails = useCurrentStepDetails();
  const sessionMeta = useAppStore((state) => state.sessionMeta);

  // Invia comando alla chat principale
  const sendToMainChat = (text: string) => {
    const { addMessage } = chatStore.getState();
    addMessage({
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
  };

  // Suggerimenti intelligenti basati sul contesto
  const getSmartSuggestions = () => {
    const suggestions = [];

    // Suggerimento principale basato sul flow
    if (riskFlowStep === 'idle') {
      suggestions.push({
        type: 'primary',
        icon: '🚀',
        title: 'Inizia da qui',
        text: 'Avvia il Risk Management per analizzare i rischi della tua azienda',
        action: () => sendToMainChat('risk management')
      });
    } else if (riskFlowStep === 'waiting_category') {
      suggestions.push({
        type: 'context',
        icon: '💡',
        title: 'Suggerimento',
        text: 'Scegli la categoria che rappresenta il rischio più critico per la tua attività',
        action: null
      });
    } else if (riskFlowStep.startsWith('assessment_q')) {
      const qNum = parseInt(riskFlowStep.replace('assessment_q', ''));
      suggestions.push({
        type: 'progress',
        icon: '📊',
        title: `Domanda ${qNum} di 5`,
        text: currentStepDetails?.questionText || 'Valuta questo aspetto del rischio',
        action: null
      });
    }

    // Suggerimenti settoriali se disponibili
    if (sessionMeta?.ateco) {
      const sectorInfo = getSectorKnowledge(sessionMeta.ateco);
      if (sectorInfo?.tips?.[0]) {
        suggestions.push({
          type: 'sector',
          icon: '🏢',
          title: 'Per il tuo settore',
          text: sectorInfo.tips[0],
          action: null
        });
      }
    }

    return suggestions;
  };

  // Azioni rapide contestuali
  const getQuickActions = () => {
    const actions = [];

    if (riskFlowStep === 'waiting_category') {
      // Bottoni per categorie
      const categories = [
        { id: 'clienti', label: 'Clienti', icon: '👥', desc: 'Rischi con clienti e prodotti' },
        { id: 'danni', label: 'Danni', icon: '⚠️', desc: 'Danni fisici a persone/strutture' },
        { id: 'sistemi', label: 'Sistemi IT', icon: '💻', desc: 'Interruzione sistemi' },
        { id: 'dipendenti', label: 'Dipendenti', icon: '👷', desc: 'Pratiche di lavoro' }
      ];

      return categories.map(cat => ({
        ...cat,
        onClick: () => sendToMainChat(cat.id)
      }));
    } else if (riskFlowStep.startsWith('assessment_q')) {
      // Opzioni numeriche per assessment
      if (currentStepDetails?.options) {
        return currentStepDetails.options.map((opt: any, idx: number) => ({
          id: `${idx + 1}`,
          label: `${idx + 1}`,
          desc: opt.label || opt,
          icon: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][idx] || '🔢',
          onClick: () => sendToMainChat(`${idx + 1}`)
        }));
      }
    } else if (riskFlowStep === 'idle') {
      // Azioni iniziali
      return [
        {
          id: 'risk',
          label: 'Risk Management',
          icon: '🛡️',
          desc: 'Avvia analisi rischi',
          primary: true,
          onClick: () => sendToMainChat('risk management')
        },
        {
          id: 'ateco',
          label: 'Analizza ATECO',
          icon: '📊',
          desc: 'Dal pannello laterale',
          onClick: () => sendToMainChat('analizza ateco')
        }
      ];
    }

    return actions;
  };

  // Comandi avanzati
  const advancedCommands = [
    { cmd: '/analizza', desc: 'Analisi approfondita del contesto', icon: '🔍' },
    { cmd: '/report', desc: 'Genera report istantaneo', icon: '📄' },
    { cmd: '/confronta', desc: 'Benchmark di settore', icon: '📈' },
    { cmd: '/help', desc: 'Mostra tutti i comandi', icon: '❓' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-16 right-0 bottom-0 w-full sm:w-[400px] md:w-[450px] lg:w-[500px]
                     bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700
                     flex flex-col z-50"
        >
          {/* Header elegante stile Microsoft */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700
                          bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Syd AI Assistant</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Risk Management Advisor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Tab Navigation stile Google */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('smart')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all
                ${activeTab === 'smart'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Lightbulb className="inline-block w-4 h-4 mr-2" />
              Suggerimenti
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all
                ${activeTab === 'actions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Zap className="inline-block w-4 h-4 mr-2" />
              Azioni Rapide
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all
                ${activeTab === 'commands'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Command className="inline-block w-4 h-4 mr-2" />
              Comandi
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Smart Suggestions Tab */}
            {activeTab === 'smart' && (
              <div className="space-y-3">
                {getSmartSuggestions().map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      suggestion.type === 'primary'
                        ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 dark:from-blue-950/30 dark:to-sky-950/30 dark:border-blue-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.text}
                        </p>
                        {suggestion.action && (
                          <button
                            onClick={suggestion.action}
                            className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg
                                     hover:bg-blue-700 transition-colors"
                          >
                            Procedi →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Context Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                    <Info size={14} />
                    <span>Fase attuale: {riskFlowStep === 'idle' ? 'In attesa' : riskFlowStep}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Tab */}
            {activeTab === 'actions' && (
              <div className="grid grid-cols-2 gap-3">
                {getQuickActions().map((action, idx) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={action.onClick}
                    className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                      action.primary
                        ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white border-blue-600 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="font-semibold text-sm mb-1">{action.label}</div>
                    <div className={`text-xs ${action.primary ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {action.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Commands Tab */}
            {activeTab === 'commands' && (
              <div className="space-y-2">
                {advancedCommands.map((cmd, idx) => (
                  <motion.div
                    key={cmd.cmd}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                             cursor-pointer transition-colors"
                    onClick={() => sendToMainChat(cmd.cmd)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cmd.icon}</span>
                      <div>
                        <code className="font-mono text-sm text-blue-600 dark:text-blue-400">{cmd.cmd}</code>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{cmd.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="text-purple-600 dark:text-purple-400" size={16} />
                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Pro Tip</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Usa i comandi per analisi avanzate e report automatici basati sul tuo settore
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar stile VS Code */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600 dark:text-gray-400">Connesso</span>
                </div>
                {sessionMeta?.ateco && (
                  <span className="text-gray-600 dark:text-gray-400">
                    ATECO: {sessionMeta.ateco}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <TrendingUp size={12} />
                <span>AI Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SydControlPanel;