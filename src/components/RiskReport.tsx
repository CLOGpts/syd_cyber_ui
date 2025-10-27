import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store';
import { useAppStore } from '../store/useStore';
import { trackEvent } from '../services/sydEventTracker';

interface RiskReportProps {
  onClose: () => void;
}

const RiskReport: React.FC<RiskReportProps> = ({ onClose }) => {
  const { riskAssessmentData, completedRisks } = useChatStore();
  const { sessionMeta } = useAppStore();

  // 📊 ACCUMULO: Usa completedRisks se disponibile, altrimenti fallback a riskAssessmentData
  const risksToDisplay = (completedRisks && completedRisks.length > 0) ? completedRisks : (riskAssessmentData ? [riskAssessmentData] : []);
  const totalRisks = risksToDisplay.length;

  const [riskScore, setRiskScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [matrixPosition, setMatrixPosition] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [clickedCell, setClickedCell] = useState<string | null>(null); // 🎯 UX: Click invece di hover
  const [selectedRiskInCell, setSelectedRiskInCell] = useState<any | null>(null); // 🎯 Rischio specifico selezionato nella cella multipla
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatrix, setShowMatrix] = useState(false);
  const [selectedRiskIndex, setSelectedRiskIndex] = useState(0); // Per navigare tra rischi multipli
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Colori per i valori di rischio
  const colorToValue: Record<string, number> = {
    'G': 4, // Verde = Low
    'Y': 3, // Giallo = Medium
    'O': 2, // Arancione = High
    'R': 1  // Rosso = Critical
  };

  const controlloToRow: Record<string, number> = {
    '--': 1, // Not Adequate
    '-': 2,  // Partially Adequate
    '+': 3,  // Substantially Adequate
    '++': 4  // Adequate
  };

  const valueToLabel = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low'
  };

  const controlLabels = {
    '--': 'Not Adequate/Absent',
    '-': 'Partially Adequate',
    '+': 'Substantially Adequate',
    '++': 'Adequate'
  };

  useEffect(() => {
    fetchRiskAssessment(); // Prima carica i dati dal backend
    // Mostra la matrice dopo un breve delay per l'effetto drammatico
    setTimeout(() => setShowMatrix(true), 500);
  }, []);

  // 📊 ACCUMULO: Refetch quando cambia il rischio selezionato
  useEffect(() => {
    if (selectedRiskIndex >= 0 && selectedRiskIndex < totalRisks) {
      fetchRiskAssessment();
      calculateRiskPosition();
    }
  }, [selectedRiskIndex]);

  // 🎯 UX PREMIUM: Blocca scroll del body quando tooltip è aperto
  useEffect(() => {
    if (clickedCell) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [clickedCell]);

  // 🎯 UX PREMIUM: Chiudi con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && clickedCell) {
        setClickedCell(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [clickedCell]);

  const calculateRiskPosition = () => {
    // 📊 ACCUMULO: Usa il rischio selezionato
    const currentRisk = risksToDisplay[selectedRiskIndex];
    if (!currentRisk) return;

    // LOGICA ESATTA DAL BACKEND - TESTATA E FUNZIONANTE!
    const economicValue = colorToValue[currentRisk.perdita_economica || 'G'];
    const nonEconomicValue = colorToValue[currentRisk.perdita_non_economica || 'G'];
    
    // MIN = il peggiore (valore più basso)
    const inherentRisk = Math.min(economicValue, nonEconomicValue);
    
    const controlRow = controlloToRow[currentRisk.controllo || '++'];
    
    // FORMULA CHIAVE DAL BACKEND: colonna = 6 - rischioInerente
    const colonnaIndex = 6 - inherentRisk;
    const colonnaLettera = ['', '', 'A', 'B', 'C', 'D'][colonnaIndex];
    const position = `${colonnaLettera}${controlRow}`;
    
    setMatrixPosition(position);
    
    // FORMULA RISK SCORE DAL BACKEND
    const inherentScore = (4 - inherentRisk) * 25;
    const controlScore = (4 - controlRow) * 12.5;
    const score = Math.min(inherentScore + controlScore, 100); // Cap a 100
    setRiskScore(Math.round(score));
  };

  const fetchRiskAssessment = async () => {
    try {
      // 📊 ACCUMULO: Usa il rischio selezionato
      const currentRisk = risksToDisplay[selectedRiskIndex];
      if (!currentRisk) {
        setIsLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_API_BASE;
      console.log('📡 Chiamata al backend con:', {
        economic_loss: currentRisk.perdita_economica || 'G',
        non_economic_loss: currentRisk.perdita_non_economica || 'G',
        control_level: currentRisk.controllo || '++'
      });

      const response = await fetch(`${backendUrl}/calculate-risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economic_loss: currentRisk.perdita_economica || 'G',
          non_economic_loss: currentRisk.perdita_non_economica || 'G',
          control_level: currentRisk.controllo || '++'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 RISPOSTA COMPLETA DAL BACKEND:', data);
        setReportData(data);

        // 🔥 TRACK REPORT GENERATION
        trackEvent('report_generated', {
          risk_score: data.residual_risk?.score || 0,
          matrix_position: data.matrix_position || 'unknown',
          inherent_risk: data.inherent_risk?.label || 'unknown',
          control_level: currentRisk.controllo || 'unknown',
          event_code: currentRisk.eventCode || 'unknown',
          timestamp: new Date().toISOString()
        });

        // USA I DATI DAL BACKEND SECONDO LA STRUTTURA CORRETTA
        if (data.matrix_position) {
          console.log('✅ Posizione matrice:', data.matrix_position);
          setMatrixPosition(data.matrix_position);
        }
        
        // Calcola risk score basato su inherent_risk e control_effectiveness
        if (data.inherent_risk && data.control_effectiveness) {
          const inherentScore = (4 - data.inherent_risk.value) * 25;
          const controlScore = (4 - data.control_effectiveness.value) * 12.5;
          const score = Math.round(Math.min(inherentScore + controlScore, 100));
          console.log('📊 Risk Score calcolato:', score);
          setRiskScore(score);
        }
        
        // Se manca la posizione dal backend, calcola localmente come fallback
        if (!data.matrix_position && riskAssessmentData) {
          console.log('⚠️ Calcolo locale di fallback');
          calculateRiskPosition();
        }
      }
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animazione del Risk Score
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= riskScore) {
            clearInterval(interval);
            return riskScore;
          }
          return prev + 2;
        });
      }, 30);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [riskScore]);

  const getCellColor = (position: string) => {
    const riskColors: Record<string, string> = {
      // Low risk (Verde)
      'A1': 'bg-green-400', 'A2': 'bg-green-400', 'A3': 'bg-green-400', 'A4': 'bg-green-400',
      'B3': 'bg-green-400', 'B4': 'bg-green-400', 'C4': 'bg-green-400',
      // Medium risk (Giallo)
      'B1': 'bg-yellow-400', 'B2': 'bg-yellow-400', 'C3': 'bg-yellow-400', 'D4': 'bg-yellow-400',
      // High risk (Arancione)
      'C1': 'bg-orange-500', 'C2': 'bg-orange-500', 'D2': 'bg-orange-500', 'D3': 'bg-orange-500',
      // Critical risk (Rosso)
      'D1': 'bg-red-600'
    };
    
    return riskColors[position] || 'bg-gray-200';
  };

  const getTooltipContent = (position: string, specificRisk?: any) => {
    const col = position[0];
    const row = position[1];

    const riskLevel = { 'A': 'Low', 'B': 'Medium', 'C': 'High', 'D': 'Critical' }[col];
    const control = { '1': 'Not Adequate/Absent', '2': 'Partially Adequate', '3': 'Substantially Adequate', '4': 'Adequate' }[row];

    const isActive = position === matrixPosition;

    // 📊 ACCUMULO: Trova TUTTI i rischi in questa cella
    const risksInCell = risksToDisplay.filter(risk => {
      const economicValue = colorToValue[risk.perdita_economica || 'G'];
      const nonEconomicValue = colorToValue[risk.perdita_non_economica || 'G'];
      const inherentRisk = Math.min(economicValue, nonEconomicValue);
      const colonnaIndex = 6 - inherentRisk;
      const colonnaLettera = ['', '', 'A', 'B', 'C', 'D'][colonnaIndex];
      const controlRow = controlloToRow[risk.controllo || '++'];
      return `${colonnaLettera}${controlRow}` === position;
    });

    // Se ci sono rischi in questa cella
    if (risksInCell.length > 0) {
      // 🎯 SE È STATO SELEZIONATO UN RISCHIO SPECIFICO: Mostra solo quello in dettaglio
      if (specificRisk) {
        const currentRisk = specificRisk;

        const economicImpact = {
          'R': 'Grave - Impatto critico che richiede azione immediata',
          'O': 'Elevato - Impatto significativo da gestire',
          'Y': 'Medio - Impatto moderato gestibile',
          'G': 'Basso - Impatto minimo'
        }[currentRisk.perdita_economica || 'G'];

        const nonEconomicImpact = {
          'R': 'Grave - Impatto critico che richiede azione immediata',
          'O': 'Elevato - Impatto significativo da gestire',
          'Y': 'Medio - Impatto moderato gestibile',
          'G': 'Basso - Impatto minimo'
        }[currentRisk.perdita_non_economica || 'G'];

        const economicLabel = {
          'R': 'impatto economico CRITICO',
          'O': 'impatto economico ELEVATO',
          'Y': 'impatto economico MEDIO',
          'G': 'impatto economico BASSO'
        }[currentRisk.perdita_economica || 'G'];

        const nonEconomicLabel = {
          'R': 'impatto non economico CRITICO',
          'O': 'impatto non economico ELEVATO',
          'Y': 'impatto non economico MEDIO',
          'G': 'impatto non economico BASSO'
        }[currentRisk.perdita_non_economica || 'G'];

        const controlLabel = {
          '--': 'controlli ASSENTI o NON ADEGUATI',
          '-': 'controlli PARZIALMENTE ADEGUATI',
          '+': 'controlli SOSTANZIALMENTE ADEGUATI',
          '++': 'controlli COMPLETAMENTE ADEGUATI'
        }[currentRisk.controllo || '++'];

        const economicValue = colorToValue[currentRisk.perdita_economica || 'G'];
        const nonEconomicValue = colorToValue[currentRisk.perdita_non_economica || 'G'];
        const worstImpact = economicValue < nonEconomicValue ? 'economico' : 'non economico';

        // Spiegazione italiana dettagliata del PERCHÉ
        const riskLevelIT = {
          'Low': 'BASSO',
          'Medium': 'MEDIO',
          'High': 'ALTO',
          'Critical': 'CRITICO'
        }[riskLevel] || riskLevel;

        const controlLevelIT = {
          'Not Adequate/Absent': 'NON ADEGUATI o ASSENTI',
          'Partially Adequate': 'PARZIALMENTE ADEGUATI',
          'Substantially Adequate': 'SOSTANZIALMENTE ADEGUATI',
          'Adequate': 'ADEGUATI'
        }[control] || control;

        const explanation = `**PERCHÉ IL RISCHIO È IN QUESTA POSIZIONE:**

📊 **Dalle tue risposte emerge:**
• Perdita Economica: ${economicImpact}
• Perdita Non Economica: ${nonEconomicImpact}

🎯 **Come viene calcolato il Rischio Inerente:**
Il sistema prende l'impatto peggiore tra economico e non economico. Nel tuo caso, l'impatto ${worstImpact} è il più grave, quindi il Rischio Inerente è classificato come **${riskLevelIT}**.

🛡️ **Come influiscono i Controlli:**
Hai indicato che i controlli sono ${controlLabel}. Questo livello di controllo determina la riga della matrice in cui si posiziona il rischio.

📍 **Posizione Finale: Cella ${position}**
L'incrocio tra Rischio Inerente ${riskLevelIT} e Controlli ${controlLevelIT} colloca il rischio nella cella **${position}**, che indica un livello di rischio residuo **${riskLevelIT}**.

⚡ **Cosa significa per te:**
${riskLevel === 'Critical'
  ? '🔴 **CRITICO** - Azione immediata richiesta! Questo rischio richiede interventi urgenti e priorità massima.'
  : riskLevel === 'High'
  ? '🟠 **ALTO** - Priorità alta. È necessario pianificare interventi di mitigazione nel breve termine.'
  : riskLevel === 'Medium'
  ? '🟡 **MEDIO** - Monitoraggio attivo necessario. Valuta interventi di miglioramento dei controlli.'
  : '🟢 **BASSO** - Rischio accettabile con i controlli attuali. Mantieni il monitoraggio ordinario.'}`;

        return {
          title: `RISCHIO ${riskLevel?.toUpperCase()} - ${control?.toUpperCase()}`,
          inherentRisk: riskLevel,
          control: control,
          economicImpact,
          nonEconomicImpact,
          requiredAction: reportData?.recommendations?.[0] || 'Implementazione immediata di controlli',
          explanation,
          eventCode: currentRisk.eventCode,
          category: currentRisk.category,
          isSingleRisk: true
        };
      }

      // 📊 SE CI SONO PIÙ RISCHI: Mostra lista
      return {
        title: `${riskLevel?.toUpperCase()} RISK - ${control?.toUpperCase()}`,
        inherentRisk: riskLevel,
        control: control,
        risks: risksInCell,
        riskCount: risksInCell.length,
        isSingleRisk: false
      };
    }
    
    return {
      title: `${riskLevel} Risk - ${control}`,
      inherentRisk: riskLevel,
      control: control
    };
  };

  const getRiskStats = () => {
    const levels = {
      'A': { label: 'Low', count: 0 },
      'B': { label: 'Medium', count: 0 },
      'C': { label: 'High', count: 0 },
      'D': { label: 'Critical', count: 0 }
    };

    // 📊 ACCUMULO: Calcola statistiche su TUTTI i rischi, non solo quello corrente
    risksToDisplay.forEach(risk => {
      // Calcola la posizione matrice per ogni rischio
      const economicValue = colorToValue[risk.perdita_economica || 'G'];
      const nonEconomicValue = colorToValue[risk.perdita_non_economica || 'G'];
      const inherentRisk = Math.min(economicValue, nonEconomicValue);
      const colonnaIndex = 6 - inherentRisk;
      const colonnaLettera = ['', '', 'A', 'B', 'C', 'D'][colonnaIndex];

      // Incrementa il contatore per questo livello
      if (levels[colonnaLettera]) {
        levels[colonnaLettera].count++;
      }
    });

    return levels;
  };

  const handleCopyReport = () => {
    const currentRisk = risksToDisplay[selectedRiskIndex];
    if (!currentRisk) return;

    const tooltip = getTooltipContent(clickedCell!, selectedRiskInCell);

    const reportText = `
📊 RISK ASSESSMENT REPORT

🎯 Evento
${currentRisk.eventCode || 'N/A'} - ${currentRisk.category || 'N/A'}

📈 Rischio Inerente: ${tooltip.inherentRisk || 'N/A'}
🛡️ Livello Controlli: ${tooltip.control || 'N/A'}

💰 Impatto Economico
${tooltip.economicImpact || 'N/A'}

📊 Impatto Non Economico
${tooltip.nonEconomicImpact || 'N/A'}

💡 PERCHÉ QUESTO RISULTATO
${tooltip.explanation ? tooltip.explanation.replace(/<[^>]*>/g, '').replace(/\*\*/g, '') : 'N/A'}

⚡ AZIONE CONSIGLIATA
${tooltip.requiredAction || 'N/A'}

Posizione Matrice: ${matrixPosition}
Risk Score: ${riskScore}/100
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Report copiato negli appunti!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToConsultant = async () => {
    setIsSending(true);
    setShowConfirmDialog(false);

    const toastId = toast.loading('Generazione PDF e invio in corso...');

    try {
      const currentRisk = risksToDisplay[selectedRiskIndex];
      const tooltip = getTooltipContent(clickedCell!, selectedRiskInCell);

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/send-risk-report-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskData: {
            eventCode: currentRisk?.eventCode,
            category: currentRisk?.category,
            inherentRisk: tooltip.inherentRisk,
            control: tooltip.control,
            economicImpact: tooltip.economicImpact,
            nonEconomicImpact: tooltip.nonEconomicImpact,
            explanation: tooltip.explanation,
            requiredAction: tooltip.requiredAction,
            matrixPosition,
            riskScore
          },
          telegramChatId: '5123398987'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Report inviato con successo su Telegram!', { id: toastId });
      } else {
        throw new Error(result.error || 'Errore durante l\'invio');
      }
    } catch (error) {
      console.error('Errore invio report:', error);
      toast.error('❌ Errore durante l\'invio del report', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  const stats = getRiskStats();

  return (
    <>
      <AnimatePresence>
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con animazione spettacolare */}
          <div className="relative p-8 border-b border-white/10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                RISK ASSESSMENT REPORT
              </h1>
              <p className="text-xl text-gray-300">
                {sessionMeta.nome || 'Company'} - {sessionMeta.ateco || 'ATECO'}
              </p>
              {/* 📊 ACCUMULO: Mostra evento corrente */}
              {risksToDisplay[selectedRiskIndex] && (
                <p className="text-sm text-gray-400 mt-1">
                  Evento: {risksToDisplay[selectedRiskIndex].eventCode} - {risksToDisplay[selectedRiskIndex].category}
                </p>
              )}

              {/* 📊 ACCUMULO: Mostra totale rischi e navigatore */}
              {totalRisks > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex items-center justify-center gap-4"
                >
                  <button
                    onClick={() => setSelectedRiskIndex(Math.max(0, selectedRiskIndex - 1))}
                    disabled={selectedRiskIndex === 0}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Precedente
                  </button>
                  <span className="text-lg font-semibold text-white">
                    Rischio {selectedRiskIndex + 1} di {totalRisks}
                  </span>
                  <button
                    onClick={() => setSelectedRiskIndex(Math.min(totalRisks - 1, selectedRiskIndex + 1))}
                    disabled={selectedRiskIndex === totalRisks - 1}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Successivo →
                  </button>
                </motion.div>
              )}
              {totalRisks === 1 && (
                <p className="mt-2 text-sm text-gray-400">1 rischio valutato</p>
              )}
            </motion.div>
            
            {/* Risk Score Animato Grande */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="absolute top-8 right-8"
            >
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(animatedScore / 100) * 352} 352`}
                    className={
                      animatedScore >= 75 ? "text-green-400" :
                      animatedScore >= 50 ? "text-yellow-400" :
                      animatedScore >= 25 ? "text-orange-500" :
                      "text-red-600"
                    }
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ strokeDasharray: `${(animatedScore / 100) * 352} 352` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{animatedScore}</span>
                  <span className="text-xs text-gray-400">RISK SCORE</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="p-8">
            {/* Matrice di Rischio 4x4 con effetto WOW */}
            {showMatrix && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">📊</span> Risk Matrix Position
                </h2>
                
                <div className="bg-black/30 rounded-2xl p-6 backdrop-blur">
                  {/* Labels */}
                  <div className="flex items-end mb-4">
                    <div className="w-32"></div>
                    <div className="flex-1 text-center">
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Inherent Risk</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-green-400 font-semibold">Low</div>
                        <div className="text-yellow-400 font-semibold">Medium</div>
                        <div className="text-orange-500 font-semibold">High</div>
                        <div className="text-red-600 font-semibold">Critical</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {/* Control labels */}
                    <div className="w-32 pr-4">
                      <div className="h-full flex flex-col justify-between py-2">
                        <div className="text-right text-sm text-gray-400 h-20 flex items-center justify-end">Not<br/>Adequate</div>
                        <div className="text-right text-sm text-gray-400 h-20 flex items-center justify-end">Partially<br/>Adequate</div>
                        <div className="text-right text-sm text-gray-400 h-20 flex items-center justify-end">Substantially<br/>Adequate</div>
                        <div className="text-right text-sm text-gray-400 h-20 flex items-center justify-end">Adequate</div>
                      </div>
                    </div>
                    
                    {/* Matrix Grid */}
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      {['1', '2', '3', '4'].map(row => (
                        ['A', 'B', 'C', 'D'].map(col => {
                          const cellPos = `${col}${row}`;
                          const isActive = cellPos === matrixPosition;
                          const tooltip = getTooltipContent(cellPos);

                          // 📊 ACCUMULO: Conta quanti rischi ci sono in questa cella
                          const risksInThisCell = risksToDisplay.filter(risk => {
                            const economicValue = colorToValue[risk.perdita_economica || 'G'];
                            const nonEconomicValue = colorToValue[risk.perdita_non_economica || 'G'];
                            const inherentRisk = Math.min(economicValue, nonEconomicValue);
                            const colonnaIndex = 6 - inherentRisk;
                            const colonnaLettera = ['', '', 'A', 'B', 'C', 'D'][colonnaIndex];
                            const controlRow = controlloToRow[risk.controllo || '++'];
                            return `${colonnaLettera}${controlRow}` === cellPos;
                          }).length;

                          return (
                            <motion.div
                              key={cellPos}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                delay: Math.random() * 0.5,
                                type: "spring",
                                stiffness: 300
                              }}
                              className="relative group"
                              onMouseEnter={() => setHoveredCell(cellPos)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div
                                className={`
                                  h-20 rounded-xl flex items-center justify-center cursor-pointer
                                  transition-all duration-300 relative overflow-hidden
                                  ${getCellColor(cellPos)}
                                  ${isActive ? 'ring-4 ring-white shadow-2xl scale-110 z-10' : 'hover:scale-105'}
                                `}
                              >
                                {/* Pulse effect per cella attiva */}
                                {isActive && (
                                  <>
                                    <motion.div
                                      className="absolute inset-0 bg-white"
                                      animate={{ opacity: [0, 0.3, 0] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div
                                      className="absolute inset-0"
                                      animate={{ scale: [1, 1.5, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <div className="w-full h-full bg-white/20 rounded-xl" />
                                    </motion.div>
                                  </>
                                )}
                                
                                <span className={`
                                  font-bold text-lg z-10 relative
                                  ${isActive ? 'text-white text-2xl' : 'text-black/70'}
                                `}>
                                  {cellPos}
                                </span>

                                {/* 📊 ACCUMULO: Badge con numero di rischi in questa cella - CLICCABILE */}
                                {risksInThisCell > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setClickedCell(cellPos);
                                      setSelectedRiskInCell(null); // Reset quando cambi cella
                                    }}
                                    className="absolute top-1 right-1 bg-white text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-xl z-50 border-2 border-gray-800 cursor-pointer hover:scale-110 hover:bg-sky-400 hover:text-white transition-all"
                                  >
                                    {risksInThisCell}
                                  </motion.div>
                                )}

                                {/* Ripple effect on hover */}
                                {hoveredCell === cellPos && !isActive && (
                                  <motion.div
                                    className="absolute inset-0 bg-white/30"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 2 }}
                                    transition={{ duration: 0.5 }}
                                  />
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabella Riassuntiva con Animazione */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📈</span> Risk Summary
              </h2>
              
              <div className="bg-black/30 rounded-2xl p-6 backdrop-blur">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3">Risk Level</th>
                      <th className="text-center py-3">Count</th>
                      <th className="text-right py-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats).map(([key, value], index) => (
                      <motion.tr
                        key={key}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="border-b border-white/10"
                      >
                        <td className="py-3">
                          <span className={`
                            font-semibold
                            ${key === 'A' ? 'text-green-400' :
                              key === 'B' ? 'text-yellow-400' :
                              key === 'C' ? 'text-orange-500' :
                              'text-red-600'}
                          `}>
                            {value.label}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + index * 0.1, type: "spring" }}
                            className="inline-block"
                          >
                            {value.count}
                          </motion.span>
                        </td>
                        <td className="text-right py-3">
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: `${totalRisks > 0 ? (value.count / totalRisks) * 100 : 0}%` }}
                            transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full relative"
                            style={{ minWidth: value.count > 0 ? '60px' : '0' }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                              {totalRisks > 0 ? Math.round((value.count / totalRisks) * 100) : 0}%
                            </span>
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-3 pt-4">Total</td>
                      <td className="text-center py-3 pt-4">{totalRisks}</td>
                      <td className="text-right py-3 pt-4">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>

            {/* Raccomandazioni con effetto */}
            {reportData?.recommendations && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">💡</span> Recommended Actions
                </h2>
                
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 backdrop-blur border border-white/10">
                  <div className="space-y-3">
                    {reportData.recommendations.map((rec: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-2xl mt-1">⚡</span>
                        <p className="text-gray-200 flex-1">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer con azioni */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex justify-center gap-4"
            >
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-xl"
              >
                ❌ CHIUDI REPORT
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl"
              >
                🖨️ Print Report
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tooltip FUORI dal loop - Rendering condizionale basato su clickedCell */}
        {clickedCell && (
          <>
            {/* Backdrop scuro per coprire tutto lo sfondo - DOMINANTE + FLEX CENTRATO */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/98 backdrop-blur-md flex items-center justify-center"
              style={{ zIndex: 999999 }}
              onClick={() => setClickedCell(null)}
            >
              {/* Tooltip centrato con FLEXBOX - MODALE PREMIUM DOMINANTE */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, type: "spring" }}
                style={{
                  zIndex: 1000000,
                  maxWidth: '700px',
                  width: '90vw',
                  maxHeight: '85vh'
                }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-sky-400/40"
                onClick={(e) => e.stopPropagation()}
              >
              {(() => {
                const tooltip = getTooltipContent(clickedCell, selectedRiskInCell);
                return (
                  <>
                    {/* Header con gradiente e pulsante chiudi */}
                    <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-4 sticky top-0 z-10 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        {/* Pulsante Indietro - mostrato solo se selectedRiskInCell è attivo */}
                        {selectedRiskInCell && (
                          <button
                            onClick={() => setSelectedRiskInCell(null)}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            aria-label="Torna alla lista"
                          >
                            ←
                          </button>
                        )}
                        <h3 className="font-bold text-xl text-white flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          {tooltip.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setClickedCell(null);
                          setSelectedRiskInCell(null);
                        }}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        aria-label="Chiudi"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative">
                      <div className="p-5 text-white overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                        {/* 🎯 SINGOLO RISCHIO: Mostra spiegazione dettagliata */}
                        {tooltip.isSingleRisk && (
                          <>
                            {/* Info evento */}
                            {tooltip.eventCode && (
                              <div className="mb-4 pb-3 border-b border-white/10">
                                <p className="text-sm text-gray-400">Evento</p>
                                <p className="font-bold text-white">{tooltip.eventCode} - {tooltip.category}</p>
                              </div>
                            )}

                            {/* Dati principali in cards */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 rounded-lg p-3 border border-white/10"
                              >
                                <p className="text-xs text-gray-400 mb-1">Rischio Inerente</p>
                                <p className="font-bold text-lg text-sky-300">{tooltip.inherentRisk}</p>
                              </motion.div>
                              <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 rounded-lg p-3 border border-white/10"
                              >
                                <p className="text-xs text-gray-400 mb-1">Livello Controlli</p>
                                <p className="font-bold text-lg text-green-300">{tooltip.control}</p>
                              </motion.div>
                            </div>

                            {/* Impatti */}
                            {(tooltip.economicImpact || tooltip.nonEconomicImpact) && (
                              <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2 mb-4"
                              >
                                {tooltip.economicImpact && (
                                  <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                    <span className="text-xl">💰</span>
                                    <div>
                                      <p className="text-xs text-gray-400">Impatto Economico</p>
                                      <p className="text-sm text-orange-300">{tooltip.economicImpact}</p>
                                    </div>
                                  </div>
                                )}
                                {tooltip.nonEconomicImpact && (
                                  <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                    <span className="text-xl">📊</span>
                                    <div>
                                      <p className="text-xs text-gray-400">Impatto Non Economico</p>
                                      <p className="text-sm text-purple-300">{tooltip.nonEconomicImpact}</p>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Explanation - IL PERCHÉ */}
                            {tooltip.explanation && (
                              <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-r from-blue-500/10 to-sky-500/10 border-2 border-sky-500/30 rounded-xl p-5 mb-4"
                              >
                                <h4 className="text-base font-bold text-sky-300 mb-4 flex items-center gap-2">
                                  <span>💡</span> PERCHÉ QUESTO RISULTATO
                                </h4>
                                <div
                                  className="text-sm leading-loose text-gray-100 space-y-4"
                                  dangerouslySetInnerHTML={{
                                    __html: tooltip.explanation
                                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                                      .replace(/• /g, '<br/>• ')
                                      .replace(/\n\n/g, '<div class="h-3"></div>')
                                      .replace(/\n/g, '<br/>')
                                  }}
                                />
                              </motion.div>
                            )}

                            {/* Azione richiesta */}
                            {tooltip.requiredAction && (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3"
                              >
                                <span className="text-2xl">⚡</span>
                                <div>
                                  <p className="text-sm text-gray-300 mb-2 font-semibold">💡 AZIONE CONSIGLIATA</p>
                                  <p className="text-sm leading-relaxed text-green-200">{tooltip.requiredAction}</p>
                                </div>
                              </motion.div>
                            )}

                            {/* 📤 AZIONI: Copia e Invia */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="mt-6 flex gap-3 border-t border-white/10 pt-4"
                            >
                              <button
                                onClick={handleCopyReport}
                                disabled={copied}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 disabled:opacity-50 border border-white/10 hover:border-sky-400/50"
                              >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                <span className="font-medium">{copied ? 'Copiato!' : 'Copia'}</span>
                              </button>

                              <button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={isSending}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                              >
                                <Send size={18} />
                                <span className="font-medium">Invia al Consulente</span>
                              </button>
                            </motion.div>
                          </>
                        )}

                        {/* 📊 MULTIPLI RISCHI: Mostra lista */}
                        {!tooltip.isSingleRisk && tooltip.risks && tooltip.risks.length > 0 && (
                          <>
                            <div className="mb-4">
                              <p className="text-sm text-gray-300">
                                {tooltip.riskCount} {tooltip.riskCount === 1 ? 'evento' : 'eventi'} in questa cella:
                              </p>
                            </div>

                            <div className="space-y-3 max-h-80 overflow-y-auto">
                              {tooltip.risks.map((risk: any, idx: number) => (
                                <motion.div
                                  key={idx}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 * idx }}
                                  onClick={() => setSelectedRiskInCell(risk)}
                                  className={`
                                    bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer
                                    hover:bg-white/10 hover:border-sky-400/50 transition-all
                                    ${risk === risksToDisplay[selectedRiskIndex] ? 'ring-2 ring-sky-400' : ''}
                                  `}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="font-bold text-white">{risk.eventCode}</p>
                                      <p className="text-xs text-gray-400">{risk.category}</p>
                                    </div>
                                    {risk === risksToDisplay[selectedRiskIndex] && (
                                      <span className="text-xs bg-sky-500 text-white px-2 py-1 rounded-full">
                                        Corrente
                                      </span>
                                    )}
                                  </div>

                                  {/* Dettagli compatti */}
                                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <div>
                                      <span className="text-gray-400">Economico:</span>
                                      <span className={`ml-1 font-semibold ${
                                        risk.perdita_economica === 'R' ? 'text-red-400' :
                                        risk.perdita_economica === 'O' ? 'text-orange-400' :
                                        risk.perdita_economica === 'Y' ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {risk.perdita_economica}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Non Eco:</span>
                                      <span className={`ml-1 font-semibold ${
                                        risk.perdita_non_economica === 'R' ? 'text-red-400' :
                                        risk.perdita_non_economica === 'O' ? 'text-orange-400' :
                                        risk.perdita_non_economica === 'Y' ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {risk.perdita_non_economica}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-2 text-xs">
                                    <span className="text-gray-400">Controllo:</span>
                                    <span className="ml-1 font-semibold text-blue-300">
                                      {risk.controllo} - {controlLabels[risk.controllo as keyof typeof controlLabels]}
                                    </span>
                                  </div>

                                  {/* Indicatore cliccabile */}
                                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                    <span className="text-sky-400 font-medium">👁️ Clicca per dettagli completi</span>
                                    <span className="text-gray-500">→</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Messaggio per celle vuote */}
                        {!tooltip.isSingleRisk && (!tooltip.risks || tooltip.risks.length === 0) && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-400">
                              Nessun evento valutato in questa cella
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Livello: {tooltip.inherentRisk} | Controllo: {tooltip.control}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Scroll indicator gradient - subtle */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none rounded-b-2xl" />
                    </div>
                  </>
                );
              })()}
              </motion.div>
            </motion.div>
          </>
        )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Dialog - Separate AnimatePresence */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md mx-4 border border-sky-500/30"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-sky-500/20 rounded-full border border-sky-500/30">
                  <Send size={24} className="text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Invia al Consulente
                </h3>
              </div>

              <p className="text-gray-300 mb-6">
                Vuoi generare e inviare questo report di risk assessment in formato PDF al tuo consulente via Telegram?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors border border-white/10"
                >
                  No, annulla
                </button>
                <button
                  onClick={handleSendToConsultant}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Sì, invia
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RiskReport;