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
      className="w-full px-3 sm:px-4 lg:px-6 mb-4"
    >
      <div className="rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-sm border border-sky-500/20 shadow-xl shadow-black/20">
        
        {/* Header */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              DESCRIZIONE DEL CONTROLLO <span className="text-xs font-normal">(generata automaticamente)</span>
            </h3>
          </div>
          
          <div className="border-b border-sky-500/20" />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-slate-900/50">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold mb-2 text-white">
                {controlTitle}
              </p>
              <p className="text-sm leading-relaxed text-gray-300">
                {controlDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with timestamp */}
        <div className="px-4 sm:px-5 lg:px-6 py-2 sm:py-3 bg-slate-800/30">
          <p className="text-xs text-right text-gray-500">
            {timestamp}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlDescriptionCard;