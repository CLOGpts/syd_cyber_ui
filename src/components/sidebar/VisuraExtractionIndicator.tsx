import React from 'react';
import { FileSearch, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface VisuraExtractionIndicatorProps {
  status: 'idle' | 'extracting' | 'success' | 'error';
  method?: 'backend' | 'ai' | 'chat';
  message?: string;
}

const VisuraExtractionIndicator: React.FC<VisuraExtractionIndicatorProps> = ({ 
  status, 
  method, 
  message 
}) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'extracting':
        return {
          icon: <Loader2 className="animate-spin" size={20} />,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700 dark:text-blue-300',
          title: 'Estrazione visura in corso...',
          subtitle: method === 'backend' ? '🔧 Analisi strutturata' : 
                   method === 'ai' ? '🤖 Intelligenza artificiale' : 
                   '💬 Assistenza manuale'
        };
      case 'success':
        return {
          icon: <CheckCircle size={20} />,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-500',
          textColor: 'text-green-700 dark:text-green-300',
          title: 'Estrazione completata!',
          subtitle: `Metodo: ${method === 'backend' ? 'Analisi strutturata' : 
                              method === 'ai' ? 'AI' : 'Manuale'}`
        };
      case 'error':
        return {
          icon: <AlertCircle size={20} />,
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-700 dark:text-orange-300',
          title: 'Estrazione parziale',
          subtitle: message || 'Alcuni dati potrebbero mancare'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`
      p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}
      transition-all duration-300 animate-fadeIn
    `}>
      <div className="flex items-start gap-3">
        <div className={config.textColor}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${config.textColor}`}>
            {config.title}
          </h4>
          <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
            {config.subtitle}
          </p>
          
          {status === 'extracting' && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-xs">
                <FileSearch size={14} className={config.textColor} />
                <span className={config.textColor}>
                  Analisi codici ATECO...
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          )}

          {status === 'success' && message && (
            <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded">
              <p className="text-xs">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisuraExtractionIndicator;