import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ATECOSkeletonLoader } from '../ui/SkeletonLoader';
import { ChevronDown, FileText, Shield, Award, AlertTriangle, Eye } from 'lucide-react';

export interface ATECOResponseData {
  lookup: {
    codice2022?: string;
    titolo2022?: string;
    codice2025?: string;
    titolo2025?: string;
  };
  arricchimento: string;
  normative: string[];
  certificazioni: string[];
  rischi: {
    operativi: string[];
    compliance: string[];
    cyber: string[];
    reputazionali: string[];
  };
}

interface ATECOResponseCardProps {
  data: ATECOResponseData;
  isLoading?: boolean;
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

const riskCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

const ATECOResponseCard: React.FC<ATECOResponseCardProps> = ({ data, isLoading }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lookup: true,
    arricchimento: true,
    normative: false,
    certificazioni: false,
    rischi: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  if (isLoading) {
    return <ATECOSkeletonLoader />;
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/90 dark:to-slate-700/90 rounded-xl p-6 shadow-lg space-y-6 text-slate-900 dark:text-slate-100"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Lookup diretto */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <h3 className="text-lg font-bold text-sky-600 dark:text-sky-400 mb-3 flex items-center">
          <span className="mr-2">🔎</span> Lookup diretto (API)
        </h3>
        <div className="space-y-1 text-sm">
          {data.lookup.codice2022 && (
            <p><strong>Codice ATECO 2022:</strong> {data.lookup.codice2022}</p>
          )}
          {data.lookup.titolo2022 && (
            <p><strong>Titolo ufficiale 2022:</strong> {data.lookup.titolo2022}</p>
          )}
          {data.lookup.codice2025 && (
            <p><strong>Codice ATECO 2025 rappresentativo:</strong> {data.lookup.codice2025}</p>
          )}
          {data.lookup.titolo2025 && (
            <p><strong>Titolo ufficiale 2025:</strong> {data.lookup.titolo2025}</p>
          )}
        </div>
      </motion.section>

      {/* Arricchimento consulenziale */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}>
        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <span className="mr-2">📌</span> Arricchimento consulenziale
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.arricchimento}</p>
      </motion.section>

      {/* Normative */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}>
        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center">
          <span className="mr-2">📜</span> Normative UE e nazionali rilevanti
        </h3>
        <ul className="space-y-1 text-sm">
          {data.normative.map((norm, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-indigo-500 dark:text-indigo-400 mr-2">•</span>
              <span>{norm}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Certificazioni */}
      <motion.section 
        className="border-b border-slate-300 dark:border-slate-600 pb-4"
        variants={sectionVariants}
        whileHover={{ x: 5 }}
        transition={{ type: "spring" as const, stiffness: 300 }}>
        <h3 className="text-lg font-bold text-sky-600 dark:text-sky-400 mb-3 flex items-center">
          <span className="mr-2">📑</span> Certificazioni ISO / schemi tipici del settore
        </h3>
        <ul className="space-y-1 text-sm">
          {data.certificazioni.map((cert, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-sky-500 dark:text-sky-400 mr-2">•</span>
              <span>{cert}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Rischi */}
      <motion.section variants={sectionVariants}>
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center">
          <span className="mr-2">⚠️</span> Rischi principali da gestire
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rischi Operativi */}
          <motion.div 
            className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-slate-900 dark:text-slate-100"
            variants={riskCardVariants}
            whileHover="hover">
            <h4 className="font-semibold text-sky-600 dark:text-sky-400 mb-2 text-sm">
              Operativi
            </h4>
            <ul className="space-y-1 text-xs">
              {data.rischi.operativi.map((risk, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-sky-500 dark:text-sky-400 mr-1">›</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Rischi Compliance */}
          <motion.div 
            className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-slate-900 dark:text-slate-100"
            variants={riskCardVariants}
            whileHover="hover">
            <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-sm">
              Compliance
            </h4>
            <ul className="space-y-1 text-xs">
              {data.rischi.compliance.map((risk, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-indigo-500 dark:text-indigo-400 mr-1">›</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Rischi Cyber */}
          <motion.div 
            className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-slate-900 dark:text-slate-100"
            variants={riskCardVariants}
            whileHover="hover">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 text-sm">
              Cyber / OT
            </h4>
            <ul className="space-y-1 text-xs">
              {data.rischi.cyber.map((risk, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-1">›</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Rischi Reputazionali */}
          <motion.div 
            className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-slate-900 dark:text-slate-100"
            variants={riskCardVariants}
            whileHover="hover">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 text-sm">
              Reputazionali
            </h4>
            <ul className="space-y-1 text-xs">
              {data.rischi.reputazionali.map((risk, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-1">›</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default ATECOResponseCard;