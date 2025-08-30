import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, CheckCircle, Loader2, X } from 'lucide-react';
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
    debounce(async (partial: string | undefined | null) => {
      if (!partial || typeof partial !== 'string' || partial.length < 2) {
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
    onChange(code);  // Aggiorna il valore nel campo input
    onSelect(code);  // Passa direttamente il codice senza delay
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative group">
        <motion.input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 pr-12 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        
        {/* Clear button */}
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </motion.button>
        )}
        
        {/* Search/Loading icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={18} className="text-blue-500" />
            </motion.div>
          ) : value && suggestions.length > 0 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <CheckCircle size={18} className="text-green-500" />
            </motion.div>
          ) : (
            <Search size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
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
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto overflow-x-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="py-2"
            >
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.code}
                  variants={itemVariants}
                  whileHover={{ 
                    x: 5,
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(suggestion.code)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-150 ${
                    index === selectedIndex 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp size={16} className="text-blue-500 flex-shrink-0" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                        {suggestion.code}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {suggestion.title}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={suggestionVariants}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="flex flex-col items-center justify-center py-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Search size={24} className="text-slate-400 mb-2" />
            </motion.div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
              Nessun codice ATECO trovato
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
              Prova con un codice diverso
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ATECOAutocomplete;