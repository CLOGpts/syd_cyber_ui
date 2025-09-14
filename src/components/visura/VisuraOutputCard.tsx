import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Lock, TrendingUp, FileText, Server, Shield, Copy, Check } from 'lucide-react';

interface VisuraOutputCardProps {
  visuraData: {
    partitaIva?: string | null;
    codiceAteco?: string | null;
    oggettoSociale?: string | null;
    confidence?: number;
    method?: string;
  };
  isDarkMode: boolean;
}

// Varianti di animazione per stagger effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const VisuraOutputCard: React.FC<VisuraOutputCardProps> = ({ visuraData, isDarkMode }) => {
  const { partitaIva, codiceAteco, oggettoSociale, confidence = 0, method = 'mixed' } = visuraData;
  const [copied, setCopied] = useState(false);
  
  const fieldsFound = [partitaIva, codiceAteco, oggettoSociale].filter(Boolean).length;
  const confidencePercentage = Math.round((fieldsFound / 3) * 100);
  
  const handleCopy = () => {
    const copyText = `VISURA ELABORATA
━━━━━━━━━━━━━━━━
SISTEMA STRICT - 3 CAMPI FONDAMENTALI

PARTITA IVA: ${partitaIva || 'Non trovata'}
CODICE ATECO: ${codiceAteco || 'Non trovato'}
OGGETTO SOCIALE: ${oggettoSociale || 'Non trovato'}

CONFIDENCE: ${confidencePercentage}% - ${fieldsFound}/3 campi validi
METODO: ${method === 'mixed' ? 'Misto' : method}`;
    
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/90 dark:to-slate-700/90 rounded-xl p-6 shadow-lg space-y-6 relative max-w-3xl text-slate-900 dark:text-slate-100"
    >
      {/* Pulsante copia in alto a destra */}
      <button
        onClick={handleCopy}
        className="absolute -top-3 -right-3 p-1.5 bg-card-light dark:bg-slate-600 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
        title={copied ? "Copiato!" : "Copia"}
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-text-muted-light dark:text-text-muted-dark" />}
      </button>

      {/* Header con successo */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-sky-500" />
          <span className="text-sky-500 font-bold text-lg">Visura elaborata con successo!</span>
        </div>
      </motion.section>
      {/* Sistema Strict - 3 Campi Fondamentali */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <span className="mr-2">🔒</span> SISTEMA STRICT - 3 CAMPI FONDAMENTALI
        </h3>
        <div className="space-y-3">
          {/* Partita IVA */}
          <div className="space-y-1 text-sm">
            <p className="flex items-start">
              <span className="text-sky-500 dark:text-sky-400 mr-2">1️⃣</span>
              <strong>PARTITA IVA:</strong>
            </p>
            <div className="ml-8">
              {partitaIva ? (
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-mono">{partitaIva}</span>
                  <span className="text-green-500 text-xs">(Validata)</span>
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Non trovata o non valida</span>
                </p>
              )}
            </div>
          </div>

          {/* CODICE ATECO */}
          <div className="space-y-1 text-sm">
            <p className="flex items-start">
              <span className="text-sky-500 dark:text-sky-400 mr-2">2️⃣</span>
              <strong>CODICE ATECO:</strong>
            </p>
            <div className="ml-8">
              {codiceAteco ? (
                <>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{codiceAteco}</span>
                  </p>
                  <p className="text-sky-500 dark:text-sky-400 text-xs mt-1">🎯 ATECO auto-popolato nella sidebar!</p>
                </>
              ) : (
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500">Non trovato o formato invalido</span>
                </p>
              )}
            </div>
          </div>

          {/* OGGETTO SOCIALE */}
          <div className="space-y-1 text-sm">
            <p className="flex items-start">
              <span className="text-sky-500 dark:text-sky-400 mr-2">3️⃣</span>
              <strong>OGGETTO SOCIALE:</strong>
            </p>
            <div className="ml-8">
              {oggettoSociale ? (
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{oggettoSociale}</span>
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Non trovato o troppo breve (min 30 caratteri)</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CONFIDENCE REALE */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center">
          <span className="mr-2">📊</span> CONFIDENCE REALE
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= fieldsFound ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">
              {confidencePercentage}% - {fieldsFound}/3 campi validi
            </span>
          </div>
          <p className="text-xs">
            {fieldsFound === 3 ? '✅ Tutti i campi estratti e validati' :
             fieldsFound === 2 ? '⚠️ 2 campi su 3 trovati' :
             fieldsFound === 1 ? '⚠️ Solo 1 campo trovato' :
             '❌ Nessun campo valido trovato'}
          </p>
        </div>
      </motion.section>

      {/* METODO ESTRAZIONE */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-3 flex items-center">
          <span className="mr-2">🔧</span> METODO ESTRAZIONE
        </h3>
        <p className="text-sm">
          {method === 'backend' ? '⚡ Sistema Diretto (Backend)' :
           method === 'ai' ? '🤖 Assistito AI (Gemini)' :
           '📊 Metodo Misto'}
        </p>
      </motion.section>

      {/* Info aggiuntive */}
      <motion.section 
        className="pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center">
          <span className="mr-2">📌</span> Info Sistema
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Dati salvati nel pannello laterale</span>
          </li>
          {codiceAteco && (
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>ATECO automaticamente inserito nella sidebar!</span>
            </li>
          )}
          {!codiceAteco && (
            <li className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500">Inserire manualmente il codice ATECO nella sidebar</span>
            </li>
          )}
        </ul>
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Sistema certificato - Nessun dato inventato - Meglio null che sbagliato</span>
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default VisuraOutputCard;