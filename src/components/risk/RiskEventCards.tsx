import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Hash, Loader2, Lock } from 'lucide-react';
import { chatStore } from '../../store/chatStore';
import ConfirmChangeModal from '../modals/ConfirmChangeModal';

interface RiskEventCardsProps {
  events: any[];
  categoryName: string;
  categoryGradient: string;
  onEventSelect: (eventCode: string) => void;
  isDarkMode?: boolean;
}

const RiskEventCards: React.FC<RiskEventCardsProps> = ({
  events,
  categoryName,
  categoryGradient,
  onEventSelect,
  isDarkMode = false
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTalibanLocked, setIsTalibanLocked] = useState(false); // 🔴 TALIBAN LOCK
  const [showModal, setShowModal] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<string | null>(null);

  // LOCKDOWN + TALIBAN: Check if process is locked or report completed
  useEffect(() => {
    const checkLock = () => {
      const state = chatStore.getState();
      const locked = state.isProcessLocked();
      const step = state.riskFlowStep;
      // 🔴 TALIBAN CHECK: Q7 o dopo = BLOCCO TOTALE
      const taliban = step === 'assessment_q7' ||
                     step === 'assessment_q8' ||
                     step === 'assessment_complete' ||
                     step === 'completed';
      setIsLocked(locked);
      setIsTalibanLocked(taliban);

      if (taliban) {
        console.log('🔴 TALIBAN: Q7/Report - EVENTI BLOCCATI PERMANENTEMENTE');
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 500);
    return () => clearInterval(interval);
  }, []);

  // Import cleanRestartAssessment e showEventDescription per gestire cambio durante assessment
  const { cleanRestartAssessment, showEventDescription } = useRiskFlow();

  // Gestione click con debounce e loading state
  const handleEventClick = useCallback(async (eventCode: string) => {
    // 🔴 TALIBAN MODE: Blocco totale dopo report
    if (isTalibanLocked) {
      console.error('🚫 TALIBAN LOCKDOWN: Report completato - NESSUNA MODIFICA POSSIBILE');
      return; // STOP TOTALE - niente modal, niente nulla
    }

    // LOCKDOWN: Check if process is active
    if (isLocked) {
      console.warn('🔒 LOCKDOWN: Risk Assessment in progress');

      // Mostra modal di conferma invece di window.confirm
      setPendingEvent(eventCode);
      setShowModal(true);
      return;
    }

    // NUOVO: Check se già selezionato DIVERSO evento (quando NON locked)
    const currentEvent = chatStore.getState().selectedEventCode;
    if (currentEvent && currentEvent !== eventCode) {
      // Mostra modal di conferma per cambio evento
      setPendingEvent(eventCode);
      setShowModal(true);
      return;
    }

    // Previeni click multipli
    if (isProcessing || loadingEvent) return;

    // Imposta loading immediato
    setLoadingEvent(eventCode);
    setIsProcessing(true);

    // Chiama la funzione originale
    onEventSelect(eventCode);

    // Reset dopo un timeout
    setTimeout(() => {
      setLoadingEvent(null);
      setIsProcessing(false);
    }, 2000);
  }, [onEventSelect, isProcessing, loadingEvent, isLocked, isTalibanLocked, cleanRestartAssessment]);

  // Extract gradient colors for consistent theming - BLUE PALETTE
  const getGradientColors = () => {
    // Sempre blu/sky per coerenza con ATECO/Visura
    return { primary: '#0ea5e9', accent: '#3b82f6', hover: 'rgba(14, 165, 233, 0.08)' };
  };

  const colors = getGradientColors();

  // Severity color mapping - subtle and professional
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      x: -10
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={`rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20 relative ${isLocked || isTalibanLocked ? 'opacity-50' : ''}`}>
        {/* 🔴 TALIBAN: Blocco TOTALE dopo report */}
        {isTalibanLocked && (
          <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-sm rounded-xl" />
        )}

        {/* LOCKDOWN: Lock Overlay normale */}
        {isLocked && !isTalibanLocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Lock size={32} className="text-white" />
              <span className="text-white text-xs font-bold">PROCESSO ATTIVO</span>
              <span className="text-white text-xs">Completa prima l'assessment in corso</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              {categoryName}
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            {events.length} eventi • Seleziona per analizzare
          </div>
          <div className="border-b border-sky-500/20 mt-3" />
        </div>

        {/* Table Section */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-900/50">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 sm:gap-3 lg:gap-4 pb-2 border-b border-sky-500/10">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                #
              </span>
            </div>
            <div className="col-span-10 sm:col-span-11">
              <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Evento
              </span>
            </div>
          </div>

          {/* Table Body with Scroll */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="
              divide-y divide-slate-700/30
              max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto scrollbar-thin
              scrollbar-track-slate-800 scrollbar-thumb-slate-700
              mt-2
            "
          >
          {events.map((event, index) => {
            let eventCode = '';
            let eventName = '';
            let severity = 'medium';

            if (typeof event === 'string') {
              const match = event.match(/\*?\*?\[?(\d+)\]?\*?\*?\s*(.+)/);
              if (match) {
                eventCode = match[1];
                eventName = match[2];
              } else {
                eventCode = (index + 1).toString().padStart(3, '0');
                eventName = event;
              }
            } else if (typeof event === 'object') {
              eventCode = event.code || (index + 1).toString().padStart(3, '0');
              eventName = event.name || event.toString();
              severity = event.severity || 'medium';
            }

            const isHovered = hoveredRow === eventCode;
            const isLoading = loadingEvent === eventCode;

            return (
              <motion.div
                key={`row-${eventCode}-${index}`}
                variants={rowVariants}
                onMouseEnter={() => setHoveredRow(eventCode)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => !isLocked && handleEventClick(eventCode)}
                className={`
                  grid grid-cols-12 gap-2 sm:gap-3 lg:gap-4 px-2 py-2 sm:py-3
                  transition-all duration-200 relative
                  ${isLocked ? 'cursor-not-allowed' : isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}
                  ${!isLocked && isHovered ? 'bg-sky-500/10' : 'bg-transparent'}
                  ${!isLocked ? 'hover:bg-sky-500/10' : ''}
                `}
                style={{
                  backgroundColor: isHovered ? colors.hover : undefined
                }}
              >
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5 text-sky-400" />
                    </motion.div>
                  </div>
                )}

                {/* Event Number */}
                <div className="col-span-2 sm:col-span-1 flex items-center">
                  <span
                    className={`
                      font-mono text-xs sm:text-sm font-semibold
                      ${isHovered
                        ? 'text-sky-400'
                        : 'text-gray-500'
                      }
                    `}
                    style={{ color: isHovered ? colors.primary : undefined }}
                  >
                    {eventCode}
                  </span>
                </div>

                {/* Event Name */}
                <div className="col-span-10 sm:col-span-11 flex items-center">
                  <span className={`
                    text-xs sm:text-sm
                    text-gray-300
                    ${isHovered ? 'font-medium text-white' : ''}
                    line-clamp-2 sm:line-clamp-none
                  `}>
                    {eventName}
                  </span>

                  {/* Show arrow on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-auto mr-2"
                      >
                        <ChevronRight 
                          className="w-4 h-4" 
                          style={{ color: colors.primary }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 lg:px-6 py-2 sm:py-3 bg-slate-800/30">
          <div className="text-xs text-center text-gray-500">
            <span className="hidden sm:inline">Click o digita numero per selezionare</span>
            <span className="sm:hidden">Tocca per selezionare</span>
          </div>
        </div>
      </div>

      {/* Confirm Change Modal */}
      <ConfirmChangeModal
        isOpen={showModal}
        title={isLocked ? "🔄 Assessment in corso" : "Cambio Evento"}
        currentItem={isLocked ? "Assessment in corso" : `Evento ${chatStore.getState().selectedEventCode || 'Non selezionato'}`}
        newItem={`Evento ${pendingEvent || ''}`}
        warningText={isLocked
          ? "Vuoi abbandonare l'assessment corrente e selezionare il nuovo evento? Tutti i progressi verranno persi."
          : "Hai già selezionato un evento. Cambiando evento, la descrizione corrente verrà rimossa."
        }
        onConfirm={async () => {
          if (!pendingEvent) return;

          setShowModal(false);

          if (isLocked) {
            console.log('✅ User confirmed event change during assessment');
            await cleanRestartAssessment(pendingEvent);
          } else {
            console.log(`✅ User confirmed event change: ${chatStore.getState().selectedEventCode} -> ${pendingEvent}`);

            // Pulisci descrizione precedente e stato evento
            chatStore.setState(state => ({
              messages: state.messages.filter(m => m.type !== 'risk-description'),
              selectedEventCode: null // Reset evento selezionato per permettere ricarica
            }));

            setLoadingEvent(pendingEvent);
            setIsProcessing(true);

            // Usa showEventDescription con forceReload per caricare nuova descrizione
            await showEventDescription(pendingEvent, true);

            setTimeout(() => {
              setLoadingEvent(null);
              setIsProcessing(false);
            }, 2000);
          }

          setPendingEvent(null);
        }}
        onCancel={() => {
          console.log('❌ User cancelled event change');
          setShowModal(false);
          setPendingEvent(null);
        }}
        confirmText="Cambia Evento"
        cancelText="Annulla"
      />
    </motion.div>
  );
};

export default RiskEventCards;