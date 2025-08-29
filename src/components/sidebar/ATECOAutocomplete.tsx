import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import { debounce } from 'lodash';

interface ATECOSuggestion {
  code: string;
  title: string;
}

interface ATECOAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (code: string) => void;
  placeholder?: string;
}

const ATECOAutocomplete: React.FC<ATECOAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Digita codice ATECO..."
}) => {
  const [suggestions, setSuggestions] = useState<ATECOSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search function
  const searchATECO = useCallback(
    debounce(async (partial: string) => {
      if (partial.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/autocomplete?partial=${partial}&limit=8`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Errore autocomplete:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchATECO(value);
  }, [value, searchATECO]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex].code);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (code: string) => {
    onChange(code);
    onSelect(code);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search size={16} className="text-gray-400" />
            </motion.div>
          ) : (
            <Search size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={suggestionVariants}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.code}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => handleSelect(suggestion.code)}
                className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/30' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.code}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={suggestionVariants}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Nessun codice ATECO trovato
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ATECOAutocomplete;