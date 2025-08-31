import React from 'react';
import { motion } from 'framer-motion';

export interface RiskResponseData {
  type: 'categories' | 'events' | 'description' | 'search_results';
  categories?: Array<{ id: string; name: string; icon: string }>;
  events?: Array<{ code: string; theme?: string; count?: number }>;
  description?: {
    category: string;
    categoryIcon: string;
    eventCode: string;
    eventTitle: string;
    description: string;
    impacts?: string[];
    mitigations?: string[];
  };
  searchResults?: Array<{ code: string; title: string; match: string }>;
}

interface RiskResponseCardProps {
  data: RiskResponseData;
  onSelect?: (value: string) => void;
}

const RiskResponseCard: React.FC<RiskResponseCardProps> = ({ data, onSelect }) => {
  if (data.type === 'categories' && data.categories) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-4">
          🛡️ Seleziona una categoria di rischio
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {data.categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect?.(cat.id)}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 text-left group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300">
                  {cat.name}
                </span>
              </div>
              <span className="text-gray-400 group-hover:text-red-500">→</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  if (data.type === 'events' && data.events) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-4">
          📋 Aree di rischio disponibili
        </h3>
        <div className="space-y-3">
          {data.events.map((event, index) => (
            <motion.button
              key={event.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect?.(event.theme || event.code)}
              className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all duration-200 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-orange-600 dark:text-orange-400">📁</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-700 dark:group-hover:text-orange-300">
                  {event.theme || event.code}
                </span>
              </div>
              {event.count && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {event.count} rischi
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  if (data.type === 'description' && data.description) {
    const desc = data.description;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{desc.categoryIcon}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
              Evento {desc.eventCode}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{desc.category}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
            {desc.eventTitle}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {desc.description}
          </p>
        </div>

        {desc.impacts && desc.impacts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              💡 Possibili impatti
            </h4>
            <ul className="space-y-1">
              {desc.impacts.map((impact, idx) => (
                <li key={idx} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {desc.mitigations && desc.mitigations.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Misure di mitigazione
            </h4>
            <ul className="space-y-1">
              {desc.mitigations.map((mitigation, idx) => (
                <li key={idx} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  }

  if (data.type === 'search_results' && data.searchResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-4">
          🔍 Risultati della ricerca
        </h3>
        <div className="space-y-2">
          {data.searchResults.map((result, index) => (
            <motion.button
              key={result.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect?.(result.code)}
              className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-200 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {result.code}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    {result.title}
                  </p>
                  {result.match && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Corrispondenza: <span className="text-purple-600 dark:text-purple-400">{result.match}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return null;
};

export default RiskResponseCard;