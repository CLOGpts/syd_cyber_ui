import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Hash, Loader2 } from 'lucide-react';

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

  // Gestione click con debounce e loading state
  const handleEventClick = useCallback((eventCode: string) => {
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
  }, [onEventSelect, isProcessing, loadingEvent]);

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
      <div className="rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20">

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
                onClick={() => handleEventClick(eventCode)}
                className={`
                  grid grid-cols-12 gap-2 sm:gap-3 lg:gap-4 px-2 py-2 sm:py-3
                  transition-all duration-200 relative
                  ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}
                  ${isHovered ? 'bg-sky-500/10' : 'bg-transparent'}
                  hover:bg-sky-500/10
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
    </motion.div>
  );
};

export default RiskEventCards;