import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store';
import { useAppStore } from '../store/useStore';

interface RiskReportProps {
  onClose: () => void;
}

const RiskReport: React.FC<RiskReportProps> = ({ onClose }) => {
  const { riskAssessmentData } = useChatStore();
  const { sessionMeta } = useAppStore();
  const [riskScore, setRiskScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [matrixPosition, setMatrixPosition] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatrix, setShowMatrix] = useState(false);

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

  const calculateRiskPosition = () => {
    if (!riskAssessmentData) return;

    // LOGICA ESATTA DAL BACKEND - TESTATA E FUNZIONANTE!
    const economicValue = colorToValue[riskAssessmentData.perdita_economica || 'G'];
    const nonEconomicValue = colorToValue[riskAssessmentData.perdita_non_economica || 'G'];
    
    // MIN = il peggiore (valore più basso)
    const inherentRisk = Math.min(economicValue, nonEconomicValue);
    
    const controlRow = controlloToRow[riskAssessmentData.controllo || '++'];
    
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
      const backendUrl = 'https://web-production-3373.up.railway.app';
      console.log('📡 Chiamata al backend con:', {
        economic_loss: riskAssessmentData?.perdita_economica || 'G',
        non_economic_loss: riskAssessmentData?.perdita_non_economica || 'G',
        control_level: riskAssessmentData?.controllo || '++'
      });
      
      const response = await fetch(`${backendUrl}/calculate-risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economic_loss: riskAssessmentData?.perdita_economica || 'G',
          non_economic_loss: riskAssessmentData?.perdita_non_economica || 'G',
          control_level: riskAssessmentData?.controllo || '++'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 RISPOSTA COMPLETA DAL BACKEND:', data);
        setReportData(data);
        
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

  const getTooltipContent = (position: string) => {
    const col = position[0];
    const row = position[1];
    
    const riskLevel = { 'A': 'Low', 'B': 'Medium', 'C': 'High', 'D': 'Critical' }[col];
    const control = { '1': 'Not Adequate/Absent', '2': 'Partially Adequate', '3': 'Substantially Adequate', '4': 'Adequate' }[row];
    
    const isActive = position === matrixPosition;
    
    if (isActive && riskAssessmentData) {
      const economicImpact = {
        'R': 'Grave - Impatto critico che richiede azione immediata',
        'O': 'Elevato - Impatto significativo da gestire',
        'Y': 'Medio - Impatto moderato gestibile',
        'G': 'Basso - Impatto minimo'
      }[riskAssessmentData.perdita_economica || 'G'];
      
      const nonEconomicImpact = {
        'R': 'Grave - Impatto critico che richiede azione immediata',
        'O': 'Elevato - Impatto significativo da gestire',
        'Y': 'Medio - Impatto moderato gestibile',
        'G': 'Basso - Impatto minimo'
      }[riskAssessmentData.perdita_non_economica || 'G'];
      
      return {
        title: `RISCHIO ${riskLevel?.toUpperCase()} - ${control?.toUpperCase()}`,
        inherentRisk: `${riskLevel}`,
        control: control,
        economicImpact,
        nonEconomicImpact,
        requiredAction: reportData?.recommendations?.[0] || 'Implementazione immediata di controlli',
        explanation: `La combinazione di un rischio inerente ${riskLevel?.toLowerCase()} con controlli ${control?.toLowerCase()} genera questo livello di rischio residuo.`
      };
    }
    
    return {
      title: `${riskLevel} Risk - ${control}`,
      inherentRisk: riskLevel,
      control: control
    };
  };

  const getRiskStats = () => {
    if (!matrixPosition) return {
      'A': { label: 'Low', count: 0 },
      'B': { label: 'Medium', count: 0 },
      'C': { label: 'High', count: 0 },
      'D': { label: 'Critical', count: 0 }
    };
    
    const riskLevel = matrixPosition[0];
    const levels = {
      'A': { label: 'Low', count: 0 },
      'B': { label: 'Medium', count: 0 },
      'C': { label: 'High', count: 0 },
      'D': { label: 'Critical', count: 0 }
    };
    
    // Imposta a 1 solo il livello attivo
    if (levels[riskLevel]) {
      levels[riskLevel].count = 1;
    }
    
    return levels;
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
                              
                              {/* Tooltip avanzato */}
                              {hoveredCell === cellPos && tooltip && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-80 p-4 bg-gray-900 rounded-xl shadow-2xl border border-white/20"
                                >
                                  <div className="text-white">
                                    <h3 className="font-bold text-lg mb-2 text-yellow-400">{tooltip.title}</h3>
                                    {isActive && (
                                      <>
                                        <div className="space-y-2 text-sm">
                                          <p><span className="text-gray-400">Inherent Risk:</span> <span className="font-semibold">{tooltip.inherentRisk}</span></p>
                                          <p><span className="text-gray-400">Control Level:</span> <span className="font-semibold">{tooltip.control}</span></p>
                                          {tooltip.economicImpact && (
                                            <p><span className="text-gray-400">Economic Impact:</span> <span className="text-orange-400">{tooltip.economicImpact}</span></p>
                                          )}
                                          {tooltip.nonEconomicImpact && (
                                            <p><span className="text-gray-400">Non-Economic Impact:</span> <span className="text-purple-400">{tooltip.nonEconomicImpact}</span></p>
                                          )}
                                          {tooltip.explanation && (
                                            <p className="pt-2 border-t border-white/10 text-blue-300">{tooltip.explanation}</p>
                                          )}
                                          {tooltip.requiredAction && (
                                            <p className="pt-2 text-green-400 font-semibold">⚡ {tooltip.requiredAction}</p>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45" />
                                </motion.div>
                              )}
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
                            animate={{ width: `${value.count * 100}%` }}
                            transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full relative"
                            style={{ minWidth: value.count > 0 ? '60px' : '0' }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                              {value.count * 100}%
                            </span>
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-3 pt-4">Total</td>
                      <td className="text-center py-3 pt-4">1</td>
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
      </motion.div>
    </AnimatePresence>
  );
};

export default RiskReport;