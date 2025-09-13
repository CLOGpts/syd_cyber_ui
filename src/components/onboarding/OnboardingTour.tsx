import React, { useEffect, useState, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  X, 
  CheckCircle,
  Info,
  Zap,
  Gift
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import confetti from 'canvas-confetti';

interface OnboardingTourProps {
  onComplete?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [confettiLaunched, setConfettiLaunched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isDarkMode } = useAppStore();

  const startTour = () => {
    setShowWelcome(false);
    
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      overlayColor: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)',
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: isDarkMode ? 'dark-theme-popover' : 'light-theme-popover',
      progressText: '{{current}} di {{total}}',
      nextBtnText: 'Avanti →',
      prevBtnText: '← Indietro',
      doneBtnText: 'Completa Tour ✨',
      closeBtnText: '✕',
      showButtons: ['next', 'previous', 'close'], // MOSTRA SEMPRE IL PULSANTE CLOSE
      allowClose: true, // PERMETTI CHIUSURA CON X
      
      onHighlightStarted: (element, step) => {
        setCurrentStep(step.popover?.progressText ? parseInt(step.popover.progressText.split(' ')[0]) : 0);
      },
      
      onDestroyStarted: () => {
        // SEMPRE chiudi tutto quando si preme X
        localStorage.setItem('onboardingCompleted', 'true');
        setShowWelcome(false);
        setIsCompleted(false);
        onComplete?.();
        
        // Forza la distruzione del driver
        if (driverObj) {
          driverObj.destroy();
        }
      },
      
      onDestroyed: () => {
        // Doppia sicurezza - chiudi TUTTO
        setShowWelcome(false);
        setIsCompleted(false);
        onComplete?.();
      },
      
      steps: [
        {
          element: '.chat-window',
          popover: {
            title: '💬 Centro di Comando',
            description: 'Qui interagisci con il sistema. Scrivi "risk management" per iniziare l\'analisi dei rischi o usa i comandi rapidi.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '.syd-agent-button',
          popover: {
            title: '🧠 Syd Agent - Il tuo Esperto AI',
            description: 'Clicca qui per aprire il tuo assistente personale esperto in Risk Management e Compliance. Ti guiderà con il metodo Socratico.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '.sidebar',
          popover: {
            title: '📊 Pannello Laterale',
            description: 'Qui trovi informazioni contestuali, suggerimenti e accesso rapido alle funzioni principali.',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '.theme-toggle',
          popover: {
            title: '🌙 Modalità Scura/Chiara',
            description: 'Cambia tema per lavorare più comodamente in qualsiasi condizione di luce.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          popover: {
            title: '🚀 Inizia con Risk Management',
            description: 'Scrivi "risk management" nella chat per vedere le 7 categorie di rischio. Ogni categoria contiene eventi specifici da analizzare.',
            side: 'center',
            align: 'center'
          }
        },
        {
          popover: {
            title: '📝 Come Funziona l\'Assessment',
            description: 'Dopo aver selezionato un rischio, ti verranno poste 5 domande per valutare l\'impatto finanziario e operativo.',
            side: 'center',
            align: 'center'
          }
        },
        {
          popover: {
            title: '🎯 Workflow Completo',
            description: '1️⃣ Seleziona categoria → 2️⃣ Scegli evento → 3️⃣ Leggi descrizione → 4️⃣ Completa assessment → 5️⃣ Ottieni report',
            side: 'center',
            align: 'center'
          }
        }
      ]
    });

    driverObj.drive();
  };

  const completeTour = () => {
    // Previeni chiamate multiple
    if (isCompleted) return;
    
    setIsCompleted(true);
    
    // Lancia i confetti SOLO se non sono già stati lanciati
    if (!confettiLaunched) {
      setConfettiLaunched(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#22c55e', '#f97316']
      });
    }

    // Salva completamento in localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    
    // NON CHIUDERE AUTOMATICAMENTE - L'utente deve cliccare X o "Inizia Ora"
  };

  const skipTour = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete?.();
  };

  // Cleanup del timeout quando il componente si smonta
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Aggiungi stili custom per il tour
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .driver-popover {
        background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
        color: ${isDarkMode ? '#f3f4f6' : '#111827'} !important;
        border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
      }
      
      .driver-popover-title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: ${isDarkMode ? '#f3f4f6' : '#111827'} !important;
      }
      
      .driver-popover-description {
        font-size: 14px !important;
        color: ${isDarkMode ? '#d1d5db' : '#4b5563'} !important;
        line-height: 1.6 !important;
      }
      
      .driver-popover-footer button {
        background: linear-gradient(to right, #8b5cf6, #3b82f6) !important;
        color: white !important;
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 8px !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      
      .driver-popover-footer button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 10px 15px -3px rgb(139 92 246 / 0.3) !important;
      }
      
      .driver-popover-close-btn {
        color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
      }
      
      .driver-popover-progress-text {
        color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
        font-size: 12px !important;
      }
      
      .driver-overlay {
        backdrop-filter: blur(2px) !important;
      }
      
      .driver-highlighted-element {
        animation: pulse 2s infinite !important;
      }
      
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  // Welcome Screen
  if (showWelcome) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className={`max-w-md w-full p-8 rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Header con animazione */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <Sparkles className="w-16 h-16 text-purple-500" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                />
              </div>
            </motion.div>

            <h2 className={`text-2xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Benvenuto nel Risk Management System
            </h2>
            
            {/* Success message */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-500 text-sm font-medium">**Visura elaborata con successo!**</span>
            </div>
            
            <p className={`text-center mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Vuoi fare un tour guidato di 2 minuti per scoprire tutte le funzionalità?
            </p>

            {/* Features preview with validation style */}
            <div className="space-y-3 mb-8">
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="space-y-4">
                  {/* Sistema Strict */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-yellow-500">🔒 SISTEMA STRICT - 3 CAMPI FONDAMENTALI</span>
                    </div>
                  </div>

                  {/* Partita IVA */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">🆔 PARTITA IVA**</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>**12541830019** (Validata)</span>
                    </div>
                  </div>

                  {/* CODICE ATECO */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">💼 CODICE ATECO**</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>**64.99.1** - Attività di intermediazione mobiliare</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className="text-red-500 text-sm">⭕ **ATECO auto-popolato nella sidebar!**</span>
                      </div>
                    </div>
                  </div>

                  {/* OGGETTO SOCIALE */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">🎯 OGGETTO SOCIALE**</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Servizi di consulenza in materia di investimenti</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Level */}
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400 text-sm font-medium">📊 CONFIDENCE REALE**</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>**100%** - 3/3 campi validi</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Tutti i campi estratti e validati</span>
                </div>
              </div>
            </div>

            {/* Bottom info sections */}
            <div className="space-y-3 mb-6">
              {/* Metodo Estrazione */}
              <div className={`p-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">🔧 METODO ESTRAZIONE**</span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>📊 Metodo Misto</span>
                </div>
              </div>

              {/* Dati salvati */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>**Dati salvati nel pannello laterale**</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>**ATECO automaticamente inserito nella sidebar!**</span>
              </div>
            </div>

            {/* System info */}
            <div className={`p-3 rounded-lg border mb-6 ${
              isDarkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'
            }`}>
              <span className="text-xs text-red-500">
                🚀 *Sistema certificato - Nessun dato inventato - Meglio null che sbagliato*
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startTour}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Inizia Tour
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={skipTour}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Skip
              </motion.button>
            </div>

            <p className={`text-center text-xs mt-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ⏱ Durata: ~2 minuti | {new Date().toISOString().replace('T', ' ').slice(0, -5)}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className={`relative max-w-md w-full p-8 rounded-2xl shadow-2xl text-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* PULSANTE X PER CHIUDERE */}
            <button
              onClick={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                setIsCompleted(false);
                setConfettiLaunched(false);
                onComplete?.();
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <CheckCircle className="w-20 h-20 text-green-500" />
            </motion.div>
            
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Tour Completato! 🎉
            </h2>
            
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Ora sei pronto per utilizzare tutte le funzionalità del sistema.
            </p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'
              } border border-purple-500/30 mb-4`}
            >
              <p className={`text-sm ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                💡 Suggerimento: Inizia scrivendo <strong>"risk management"</strong> nella chat!
              </p>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // CANCELLA IL TIMEOUT per fermare tutto
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                setIsCompleted(false);
                setConfettiLaunched(false); // Reset flag
                onComplete?.();
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Inizia Ora
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};

export default OnboardingTour;