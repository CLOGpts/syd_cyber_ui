import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Hash } from 'lucide-react';

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

  // Extract gradient colors for consistent theming
  const getGradientColors = () => {
    if (categoryGradient.includes('red')) return { primary: '#ef4444', accent: '#f97316', hover: 'rgba(239, 68, 68, 0.08)' };
    if (categoryGradient.includes('blue')) return { primary: '#3b82f6', accent: '#06b6d4', hover: 'rgba(59, 130, 246, 0.08)' };
    if (categoryGradient.includes('purple')) return { primary: '#a855f7', accent: '#ec4899', hover: 'rgba(168, 85, 247, 0.08)' };
    if (categoryGradient.includes('green')) return { primary: '#22c55e', accent: '#10b981', hover: 'rgba(34, 197, 94, 0.08)' };
    if (categoryGradient.includes('yellow')) return { primary: '#eab308', accent: '#f59e0b', hover: 'rgba(234, 179, 8, 0.08)' };
    if (categoryGradient.includes('indigo')) return { primary: '#6366f1', accent: '#a855f7', hover: 'rgba(99, 102, 241, 0.08)' };
    if (categoryGradient.includes('rose')) return { primary: '#f43f5e', accent: '#ef4444', hover: 'rgba(244, 63, 94, 0.08)' };
    return { primary: '#6b7280', accent: '#9ca3af', hover: 'rgba(107, 114, 128, 0.08)' };
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
    <div className="w-full max-w-5xl mx-auto px-6 py-4">
      {/* Elegant Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {categoryName}
        </h3>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {events.length} eventi • Seleziona per analizzare
        </div>
      </motion.div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          rounded-xl overflow-hidden
          ${isDarkMode ? 'bg-gray-800/40' : 'bg-white'}
          border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}
        `}
      >
        {/* Table Header */}
        <div className={`
          grid grid-cols-12 gap-4 px-6 py-3
          ${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}
          border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}
        `}>
          <div className="col-span-1">
            <span className={`text-xs font-medium uppercase tracking-wider ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              #
            </span>
          </div>
          <div className="col-span-11">
            <span className={`text-xs font-medium uppercase tracking-wider ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Evento
            </span>
          </div>
        </div>

        {/* Table Body with Scroll */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`
            divide-y ${isDarkMode ? 'divide-gray-700/30' : 'divide-gray-100'}
            max-h-[500px] overflow-y-auto scrollbar-thin
            ${isDarkMode ? 'scrollbar-track-gray-800 scrollbar-thumb-gray-700' : 'scrollbar-track-gray-100 scrollbar-thumb-gray-300'}
          `}
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

            return (
              <motion.div
                key={`row-${eventCode}-${index}`}
                variants={rowVariants}
                onMouseEnter={() => setHoveredRow(eventCode)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onEventSelect(eventCode)}
                className={`
                  grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer
                  transition-all duration-200
                  ${isDarkMode 
                    ? isHovered ? 'bg-gray-700/30' : 'bg-transparent'
                    : isHovered ? 'bg-gray-50' : 'bg-transparent'
                  }
                `}
                style={{
                  backgroundColor: isHovered ? colors.hover : undefined
                }}
              >
                {/* Event Number */}
                <div className="col-span-1 flex items-center">
                  <span 
                    className={`
                      font-mono text-sm font-semibold
                      ${isHovered 
                        ? `text-[${colors.primary}]` 
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }
                    `}
                    style={{ color: isHovered ? colors.primary : undefined }}
                  >
                    {eventCode}
                  </span>
                </div>

                {/* Event Name */}
                <div className="col-span-11 flex items-center">
                  <span className={`
                    text-sm
                    ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}
                    ${isHovered ? 'font-medium' : ''}
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
      </motion.div>

      {/* Elegant Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex items-center justify-center"
      >
        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Click o digita numero per selezionare
        </div>
      </motion.div>
    </div>
  );
};

export default RiskEventCards;