import React from 'react';
import { Building2, Hash, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Visura3FieldsProps {
  denominazione: string | null;
  ateco: string | null;
  oggetto_sociale: string | null;
  source?: 'backend' | 'ai_assisted' | 'backend_only';
  confidence?: number;
}

/**
 * COMPONENTE PER VISUALIZZARE I 3 CAMPI FONDAMENTALI DELLA VISURA
 * ================================================================
 * DENOMINAZIONE | CODICE ATECO | OGGETTO SOCIALE
 */
export const Visura3FieldsCard: React.FC<Visura3FieldsProps> = ({
  denominazione,
  ateco,
  oggetto_sociale,
  source = 'backend',
  confidence = 0
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header con indicatore di source */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Dati Visura Camerale
          </h2>
          <div className="flex items-center gap-3">
            {/* Confidence indicator */}
            <div className="flex items-center gap-1">
              {confidence >= 0.7 ? (
                <CheckCircle className="w-5 h-5 text-green-300" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-300" />
              )}
              <span className="text-sm text-white/90">
                {(confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            {/* Source badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              source === 'backend' 
                ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                : source === 'ai_assisted'
                ? 'bg-purple-500/20 text-purple-100 border border-purple-400/30'
                : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
            }`}>
              {source === 'backend' ? '⚡ Backend' : 
               source === 'ai_assisted' ? '🤖 AI Assisted' : 
               '📊 Data'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* DENOMINAZIONE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Denominazione
              </h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {denominazione || (
                  <span className="text-red-500 italic">Non trovato</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* CODICE ATECO */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Hash className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Codice ATECO
              </h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {ateco ? (
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-blue-600 dark:text-blue-400">
                    {ateco}
                  </code>
                ) : (
                  <span className="text-red-500 italic">Non trovato</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* OGGETTO SOCIALE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Oggetto Sociale / Attività
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                  {oggetto_sociale || (
                    <span className="text-red-500 italic">Non trovato</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con info extraction */}
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            Sistema a 2 livelli: Backend Python + AI Chirurgica
          </span>
          <span className="font-mono">
            {source === 'backend' ? '✅ Backend Success' : 
             source === 'ai_assisted' ? '🤖 AI Fallback Used' : 
             '📊 Data Extracted'}
          </span>
        </div>
      </div>
    </div>
  );
};