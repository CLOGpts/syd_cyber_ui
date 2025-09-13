import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText } from 'lucide-react';

interface ControlDescriptionCardProps {
  controlTitle?: string;
  controlDescription: string;
  timestamp?: string;
  isDarkMode?: boolean;
}

const ControlDescriptionCard: React.FC<ControlDescriptionCardProps> = ({
  controlTitle = "Parzialmente Adeguato",
  controlDescription,
  timestamp = new Date().toISOString().replace('T', ' ').slice(0, -5),
  isDarkMode = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-4"
    >
      <div className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl`}>
        
        {/* Header */}
        <div className={`px-6 py-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              DESCRIZIONE DEL CONTROLLO <span className="text-xs font-normal">(generata automaticamente)</span>
            </h3>
          </div>
          
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Content */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className={`font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {controlTitle}
              </p>
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {controlDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with timestamp */}
        <div className={`px-6 py-3 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <p className={`text-xs text-right ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {timestamp}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlDescriptionCard;