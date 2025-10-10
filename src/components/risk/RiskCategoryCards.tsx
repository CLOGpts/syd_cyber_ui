import React, { useState, useCallback, useEffect } from 'react';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import { motion } from 'framer-motion';
import {
  Flame,
  Monitor,
  Users,
  Settings,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';
import { chatStore } from '../../store/chatStore';
import ConfirmChangeModal from '../modals/ConfirmChangeModal';
import { trackEvent } from '../../services/sydEventTracker';

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  description: string;
  gradient: string;
  shadowColor: string;
}

interface RiskCategoryCardsProps {
  onCategorySelect: (categoryId: string) => void;
  isDarkMode?: boolean;
}

const RiskCategoryCards: React.FC<RiskCategoryCardsProps> = ({
  onCategorySelect,
  isDarkMode = false
}) => {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTalibanLocked, setIsTalibanLocked] = useState(false); // 🔴 TALIBAN LOCK
  const [showModal, setShowModal] = useState(false);

  // Non serve più useRiskFlow qui
  const [pendingCategory, setPendingCategory] = useState<{id: string, name: string} | null>(null);

  // LOCKDOWN + TALIBAN: Check if process is locked or report completed
  useEffect(() => {
    let mounted = true; // Flag per evitare update dopo unmount

    const checkLock = () => {
      if (!mounted) return; // Stop se componente unmounted

      const state = chatStore.getState();
      const locked = state.isProcessLocked();
      const step = state.riskFlowStep;
      // 🔴 TALIBAN CHECK: Q7 o dopo = BLOCCO TOTALE
      const taliban = step === 'assessment_q7' ||
                     step === 'assessment_q8' ||
                     step === 'assessment_complete' ||
                     step === 'completed';

      // Solo aggiorna se mounted e se valore cambiato
      if (mounted && locked !== isLocked) {
        setIsLocked(locked);
      }
      if (mounted && taliban !== isTalibanLocked) {
        setIsTalibanLocked(taliban);
      }

      if (taliban && mounted) {
        console.log('🔴 TALIBAN: Q7/Report - TUTTO BLOCCATO PERMANENTEMENTE');
      }
    };

    checkLock(); // Check iniziale
    const interval = setInterval(checkLock, 1000); // Ridotto a 1s (era 500ms)

    // Cleanup completo
    return () => {
      mounted = false; // Previeni update dopo unmount
      clearInterval(interval);
    };
  }, [isLocked, isTalibanLocked]); // Dipendenze per evitare stale closure

  // Import cleanRestartAssessment per gestire cambio durante assessment
  const { cleanRestartAssessment } = useRiskFlow();

  // Gestione click con debounce e loading state
  const handleCategoryClick = useCallback(async (categoryId: string) => {
    // 🔴 TALIBAN MODE: Blocco totale dopo report
    if (isTalibanLocked) {
      console.error('🚫 TALIBAN LOCKDOWN: Report completato - NESSUNA MODIFICA POSSIBILE');
      return; // STOP TOTALE - niente modal, niente nulla
    }

    // LOCKDOWN: Check if assessment is in progress
    if (isLocked) {
      console.warn('🔒 LOCKDOWN: Risk Assessment in progress');

      // Trova nome categoria per messaggio user-friendly
      const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;

      // Mostra modal di conferma invece di window.confirm
      const currentName = 'Assessment in corso';
      setPendingCategory({id: categoryId, name: categoryName});
      setShowModal(true);
      return;
    }

    // NUOVO: Check se già selezionata DIVERSA categoria (quando NON locked)
    const currentCategory = chatStore.getState().riskSelectedCategory;
    if (currentCategory && currentCategory !== categoryId) {
      const currentName = categories.find(c => c.id === currentCategory)?.name || currentCategory;
      const newName = categories.find(c => c.id === categoryId)?.name || categoryId;

      // Mostra modal di conferma per cambio categoria
      setPendingCategory({id: categoryId, name: newName});
      setShowModal(true);
      return;
    }

    // Previeni click multipli
    if (isProcessing || loadingCategory) return;

    // Imposta loading immediato
    setLoadingCategory(categoryId);
    setIsProcessing(true);

    // Chiama la funzione originale
    onCategorySelect(categoryId);

    // 🔥 TRACK CATEGORY SELECTION
    const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
    trackEvent('category_selected', {
      category_id: categoryId,
      category_name: categoryName,
      timestamp: new Date().toISOString()
    });

    // Reset dopo un timeout con cleanup
    const resetTimer = setTimeout(() => {
      setLoadingCategory(null);
      setIsProcessing(false);
    }, 2000);

    // Cleanup se componente unmounts
    return () => clearTimeout(resetTimer);
  }, [onCategorySelect, isProcessing, loadingCategory, isLocked, isTalibanLocked, cleanRestartAssessment]);
  const categories: RiskCategory[] = [
    {
      id: 'danni',
      name: 'DANNI FISICI',
      icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 10,
      description: 'Disastri naturali, incendi, furti',
      gradient: 'from-sky-500 to-blue-600',
      shadowColor: 'rgba(14, 165, 233, 0.3)'
    },
    {
      id: 'sistemi',
      name: 'SISTEMI & IT',
      icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 20,
      description: 'Cyber attack, downtime, data breach',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      id: 'dipendenti',
      name: 'RISORSE UMANE',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 22,
      description: 'Controversie, infortuni, turnover',
      gradient: 'from-cyan-500 to-sky-600',
      shadowColor: 'rgba(6, 182, 212, 0.3)'
    },
    {
      id: 'produzione',
      name: 'OPERATIONS',
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 59,
      description: 'Errori processo, qualità, consegne',
      gradient: 'from-teal-500 to-cyan-600',
      shadowColor: 'rgba(20, 184, 166, 0.3)'
    },
    {
      id: 'clienti',
      name: 'CLIENTI & COMPLIANCE',
      icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 44,
      description: 'Reclami, sanzioni, reputation',
      gradient: 'from-blue-600 to-sky-500',
      shadowColor: 'rgba(37, 99, 235, 0.3)'
    },
    {
      id: 'frodi interne',
      name: 'FRODI INTERNE',
      icon: <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 20,
      description: 'Appropriazione, corruzione, insider',
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    },
    {
      id: 'frodi esterne',
      name: 'FRODI ESTERNE',
      icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 16,
      description: 'Falsificazione, phishing, furto identità',
      gradient: 'from-sky-600 to-cyan-500',
      shadowColor: 'rgba(2, 132, 199, 0.3)'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6 lg:mb-8"
      >
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${
          isDarkMode ? 'text-white' : 'text-white'
        }`}>
          🛡️ Sistema Risk Management Enterprise
        </h2>
        <p className={`text-sm sm:text-base lg:text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-200'
        }`}>
          <span className="hidden sm:inline">191 scenari di rischio mappati • 100% compliance Basel II/III</span>
          <span className="sm:hidden">191 rischi • Basel II/III</span>
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCategoryClick(category.id)}
            className={`relative ${isLocked ? 'cursor-not-allowed opacity-50' : isProcessing || loadingCategory ? 'cursor-wait' : 'cursor-pointer'}`}
            style={{
              filter: isLocked ? 'grayscale(0.5)' : `drop-shadow(0 10px 25px ${category.shadowColor})`
            }}
          >
            <div className={`
              relative overflow-hidden rounded-xl
              bg-white/95 dark:bg-gray-800/95
              border border-white/20 dark:border-gray-700/50
              transition-all duration-300
              ${loadingCategory === category.id ? 'opacity-75' : 'hover:border-sky-400/50'}
              h-full flex flex-col
              backdrop-blur-sm
            `}>
              {/* 🔴 TALIBAN: Blocco TOTALE dopo report */}
              {isTalibanLocked && (
                <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-sm rounded-xl" />
              )}

              {/* LOCKDOWN: Lock Overlay normale */}
              {isLocked && !isTalibanLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <Lock size={32} className="text-white" />
                    <span className="text-white text-xs font-bold">PROCESSO ATTIVO</span>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {!isLocked && loadingCategory === category.id && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-8 h-8 text-sky-500" />
                  </motion.div>
                </div>
              )}
              {/* Gradient Header */}
              <div className={`
                h-2 w-full bg-gradient-to-r ${category.gradient}
              `} />

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl mb-2 sm:mb-3
                    bg-gradient-to-br ${category.gradient}
                    flex items-center justify-center
                    shadow-lg
                  `}
                >
                  <div className="text-white">
                    {category.icon}
                  </div>
                </motion.div>

                {/* Title and Count */}
                <div className="mb-2">
                  <h3 className={`
                    text-xs sm:text-sm lg:text-base font-bold mb-1
                    text-gray-900 dark:text-white
                  `}>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={`
                      text-lg sm:text-xl lg:text-2xl font-bold
                      bg-gradient-to-r ${category.gradient}
                      bg-clip-text text-transparent
                    `}>
                      {category.count}
                    </span>
                    <span className={`
                      text-xs sm:text-sm
                      text-gray-600 dark:text-gray-300
                    `}>
                      <span className="hidden sm:inline">eventi mappati</span>
                      <span className="sm:hidden">eventi</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`
                  text-xs sm:text-sm
                  text-gray-600 dark:text-gray-300
                  line-clamp-2
                  hidden sm:block
                `}>
                  {category.description}
                </p>

                {/* Hover Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className={`
                    absolute bottom-0 left-0 h-1
                    bg-gradient-to-r ${category.gradient}
                    transition-all duration-300
                  `}
                />
              </div>

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className={`
                  w-full h-full rounded-full
                  bg-gradient-to-br ${category.gradient}
                  blur-3xl
                `} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Confirm Change Modal */}
      <ConfirmChangeModal
        isOpen={showModal}
        title={isLocked ? "🔄 Assessment in corso" : "Cambio Categoria"}
        currentItem={isLocked ? "Assessment in corso" : (categories.find(c => c.id === chatStore.getState().riskSelectedCategory)?.name || "Nessuna categoria")}
        newItem={pendingCategory?.name || ""}
        warningText={isLocked
          ? "Vuoi abbandonare l'assessment corrente e selezionare la nuova categoria? Tutti i progressi verranno persi."
          : "Hai già selezionato una categoria. Cambiando categoria, tutti gli eventi selezionati verranno rimossi."
        }
        onConfirm={async () => {
          if (!pendingCategory) return;

          setShowModal(false);

          if (isLocked) {
            console.log('✅ User confirmed category change during assessment');

            // CLEAN RESTART - This handles assessment cleanup properly
            await cleanRestartAssessment();

            setLoadingCategory(pendingCategory.id);
            setIsProcessing(true);

            // Process the new category after cleanup
            setTimeout(() => {
              onCategorySelect(pendingCategory.id);

              setTimeout(() => {
                setLoadingCategory(null);
                setIsProcessing(false);
              }, 2000);
            }, 100);
          } else {
            console.log('✅ User confirmed category change:', chatStore.getState().riskSelectedCategory, '->', pendingCategory.id);

            // SOLUZIONE PULITA: pulisci chat e prepara per nuova categoria
            // NON toccare il lock - viene gestito solo da assessment start/end
            chatStore.setState(state => ({
              messages: state.messages.filter(m =>
                m.type === 'risk-categories' // Mantieni solo le categorie
              ),
              selectedEventCode: null,
              pendingEventCode: null,
              riskAvailableEvents: [],
              riskFlowStep: 'waiting_category' // IMPORTANTE: resetta lo stato per accettare nuova categoria
              // NON toccare isRiskProcessLocked!
            }));

            setLoadingCategory(pendingCategory.id);
            setIsProcessing(true);

            // SOLUZIONE DIRETTA: Chiama direttamente la API per caricare eventi
            setTimeout(async () => {
              console.log('🔄 CAMBIO CATEGORIA TO:', pendingCategory.name);

              // Mappa per convertire nome UI -> chiave backend
              const categoryMap: Record<string, string> = {
                "danni": "Damage_Danni",
                "sistemi & it": "Business_disruption",
                "operations": "Business_disruption",
                "dipendenti": "Employment_practices_Dipendenti",
                "produzione": "Execution_delivery_Problemi_di_produzione_o_consegna",
                "clienti & compliance": "Clients_product_Clienti",
                "frodi interne": "Internal_Fraud_Frodi_interne",
                "frodi esterne": "External_fraud_Frodi_esterne"
              };

              const categoryKey = categoryMap[pendingCategory.id];
              if (!categoryKey) {
                console.error('❌ Categoria non trovata:', pendingCategory.name);
                return;
              }

              // Chiama direttamente API
              try {
                const response = await fetch(`https://web-production-3373.up.railway.app/events/${categoryKey}`);
                const data = await response.json();

                // Aggiorna store con nuovi eventi
                chatStore.setState(state => ({
                  ...state,
                  riskSelectedCategory: categoryKey,
                  riskAvailableEvents: data.events || [],
                  riskFlowStep: 'waiting_event'
                }));

                // Aggiungi card eventi alla chat
                const { addMessage } = chatStore.getState();
                addMessage({
                  id: `risk-events-${Date.now()}`,
                  text: '',
                  type: 'risk-events',
                  sender: 'agent',
                  timestamp: new Date().toISOString(),
                  riskEventsData: {
                    events: data.events || [],
                    categoryName: pendingCategory.name.toUpperCase(),
                    categoryGradient: pendingCategory.gradient
                  }
                });

                console.log('✅ Eventi caricati:', data.events?.length);
              } catch (error) {
                console.error('❌ Errore caricamento eventi:', error);
              }
            }, 150);

            setTimeout(() => {
              setLoadingCategory(null);
              setIsProcessing(false);
            }, 2000);
          }

          setPendingCategory(null);
        }}
        onCancel={() => {
          console.log('❌ User cancelled category change');
          setShowModal(false);
          setPendingCategory(null);
        }}
        confirmText="Cambia Categoria"
        cancelText="Annulla"
      />

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`
          mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 rounded-xl
          bg-white/80 dark:bg-gray-800/80
          border border-white/20 dark:border-gray-700/50
          backdrop-blur-sm
        `}
      >
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              191
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Rischi Totali
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              7
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Categorie
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              100%
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Basel II/III
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskCategoryCards;