import React, { useState, useEffect } from 'react';
import { X, Tv, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/newsTicker.css';

// Importa le knowledge base per le date reali
import DORA_KNOWLEDGE from '../../data/knowledge/dora-regulation.json';
import NIS2_OFFICIAL from '../../data/knowledge/nis2-directive-official.json';

interface NewsItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  text: string;
  detail?: string;
  link?: string;
}

export const NewsTicker: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Calcola giorni mancanti a DORA
  const calculateDaysToDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const doraDays = calculateDaysToDeadline(DORA_KNOWLEDGE.criticalDeadline);

  // News items con dati REALI dalle knowledge base
  const newsItems: NewsItem[] = [
    {
      id: '1',
      type: 'critical',
      text: `🔴 DORA: ${doraDays} giorni alla scadenza obbligatoria`,
      detail: 'Regolamento (UE) 2022/2554 - Resilienza operativa digitale. Scadenza: 17 gennaio 2025.',
      link: '#dora'
    },
    {
      id: '2',
      type: 'warning',
      text: '⚡ NIS2 già in vigore: verifica la tua compliance',
      detail: 'Direttiva (UE) 2022/2555 - Sanzioni fino a 10M€ o 2% fatturato mondiale.',
      link: '#nis2'
    },
    {
      id: '3',
      type: 'info',
      text: '📊 Nuovo Risk Assessment disponibile: 191 scenari mappati',
      detail: 'Sistema completo Basel II/III per analisi rischi operativi.',
      link: '#risk'
    },
    {
      id: '4',
      type: 'warning',
      text: '⏰ Incident reporting NIS2: 24h per preallarme, 72h notifica',
      detail: `Art. 23 NIS2: ${NIS2_OFFICIAL.keyArticles.art23.timeline.earlyWarning.time} preallarme.`,
      link: '#incident'
    },
    {
      id: '5',
      type: 'info',
      text: '✅ ACN pubblica nuove linee guida per TLPT',
      detail: 'Test di penetrazione obbligatori ogni 3 anni per soggetti essenziali.',
      link: '#tlpt'
    }
  ];

  // Recupera stato salvato
  useEffect(() => {
    const savedState = localStorage.getItem('newsTickerVisible');
    if (savedState === 'false') {
      setIsVisible(false);
    }
  }, []);

  // Salva stato
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsTickerVisible', 'false');
  };

  const handleReopen = () => {
    setIsVisible(true);
    localStorage.setItem('newsTickerVisible', 'true');
  };

  // Se completamente chiuso, mostra solo badge
  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-20 right-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:from-sky-700 hover:to-blue-800 transition-all z-50 flex items-center gap-1"
        onClick={handleReopen}
      >
        <Tv className="w-3 h-3 animate-pulse" />
        News (5)
      </motion.button>
    );
  }

  return (
    <>
      <AnimatePresence>
        {/* Ticker principale */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isMinimized ? 24 : 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Logo e titolo */}
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-600 to-blue-700 px-4 flex items-center z-10 shadow-lg">
            <Tv className="w-4 h-4 text-white mr-2 animate-pulse" />
            <span className="text-white font-bold text-sm whitespace-nowrap">
              SYD_Cyber News
            </span>
          </div>

          {/* News scrolling */}
          <div className="h-full flex items-center relative" style={{ marginLeft: '180px', marginRight: '100px' }}>
            <div
              className="flex gap-16 whitespace-nowrap animate-scroll-news"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {/* Triplica le news per loop continuo senza interruzioni */}
              {[...newsItems, ...newsItems, ...newsItems].map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded transition-all
                    ${item.type === 'critical' ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' :
                      item.type === 'warning' ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20' :
                      'text-sky-400 hover:text-sky-300 hover:bg-sky-900/20'}
                  `}
                  onClick={() => setSelectedNews(item)}
                >
                  {item.type === 'critical' && <AlertCircle className="w-3 h-3 animate-pulse" />}
                  <span className="text-sm">{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controlli */}
          <div className="absolute right-0 top-0 h-full flex items-center gap-2 px-3 bg-gradient-to-l from-slate-900 to-transparent">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title={isMinimized ? "Espandi" : "Minimizza"}
            >
              {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Chiudi news ticker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Indicatore di scorrimento */}
          {!isMinimized && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
          )}
        </motion.div>

        {/* Popup dettagli news */}
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 max-w-md z-50"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">Dettagli News</h3>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-3">{selectedNews.detail}</p>
            <button className="text-sky-400 hover:text-sky-300 text-sm underline">
              Maggiori informazioni →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};