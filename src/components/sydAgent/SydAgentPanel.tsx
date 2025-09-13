import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Brain, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store';
// IMPORT CRITICO PER REAL-TIME: usa i selector specifici!
import { useMessages, useRiskFlowStep, useRiskSelectedCategory, useRiskAssessmentData } from '../../store';
import { useChatStore } from '../../store/useChatStore';
import { SydAgentService } from '../../services/sydAgentService';

interface SydMessage {
  id: string;
  text: string;
  sender: 'syd' | 'user';
  timestamp: string;
}

const SydAgentPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<SydMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 🎯 USA I SELECTOR PER REAL-TIME SYNC!
  const mainMessages = useMessages(); // ✅ Questo si aggiorna automaticamente!
  const riskFlowStep = useRiskFlowStep();
  const riskSelectedCategory = useRiskSelectedCategory();
  const riskAssessmentData = useRiskAssessmentData();
  
  // Debug DETTAGLIATO per vedere cosa sta ricevendo
  useEffect(() => {
    console.log('🔥 [SYD AGENT REAL-TIME] Stato aggiornato:', {
      numeroMessaggi: mainMessages.length,
      primoMsg: mainMessages[0],
      ultimoMsg: mainMessages[mainMessages.length - 1],
      faseCorrente: riskFlowStep,
      categoriaSelezionata: riskSelectedCategory
    });
  }, [mainMessages, riskFlowStep, riskSelectedCategory, riskAssessmentData]);
  
  // Deriva i valori dal flusso
  const selectedCategory = riskSelectedCategory;
  const selectedEvent = riskAssessmentData?.eventCode;
  const currentAssessmentQuestion = riskFlowStep.startsWith('assessment_q') 
    ? parseInt(riskFlowStep.replace('assessment_q', '')) 
    : undefined;
  const { isDarkMode } = useAppStore();

  // Auto-scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chiudi con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Messaggio di benvenuto
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: "Ciao, sono Syd, il tuo Senior Advisor in Risk Management. Sono qui per guidarti attraverso l'analisi dei rischi. Hai domande sul processo o vuoi approfondire qualche aspetto?",
        sender: 'syd',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: SydMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Usa il servizio Syd Agent con Gemini
      const sydService = SydAgentService.getInstance();
      
      // Debug: mostra cosa c'è nella chat principale
      console.log('[SYD AGENT] Messaggi chat principale:', mainMessages);
      
      // IMPORTANTE: Crea un riepilogo COMPLETO di TUTTO quello che c'è nella chat
      let chatSummary = "**CONTESTO ATTUALE DELL'APPLICAZIONE (L'UTENTE STA VEDENDO QUESTO):**\n\n";
      
      // Aggiungi numero di messaggi
      chatSummary += `• Messaggi nella chat principale: ${mainMessages.length}\n`;
      
      // Aggiungi stato del risk flow
      chatSummary += `• Fase Risk Management attuale: ${riskFlowStep}\n`;
      chatSummary += `• Categoria di rischio selezionata: ${riskSelectedCategory || 'Nessuna'}\n`;
      chatSummary += `• Codice evento selezionato: ${selectedEvent || 'Nessuno'}\n`;
      
      // Se ci sono eventi visibili nella schermata
      if (mainMessages.some(m => m.type === 'risk-events')) {
        chatSummary += `• L'utente sta visualizzando una lista di eventi di rischio\n`;
      }
      
      // Aggiungi info sui file caricati
      const uploadedFiles = useAppStore.getState().uploadedFiles;
      if (uploadedFiles.length > 0) {
        chatSummary += `- File caricati: ${uploadedFiles.map(f => f.name).join(', ')}\n`;
      }
      
      // Aggiungi gli ultimi messaggi
      chatSummary += "\nULTIMI MESSAGGI NELLA CHAT:\n";
      
      // Prepara gli ultimi messaggi per contesto includendo cards e dati strutturati
      const lastMainMessages = mainMessages.slice(-10).map(m => {
        let messageContent = `${m.sender === 'user' ? 'Utente' : 'Sistema'}: ${m.text}`;
        
        // Aggiungi informazioni sul tipo di messaggio
        if (m.type && m.type !== 'text') {
          messageContent += ` [TIPO: ${m.type}]`;
        }
        
        // Aggiungi dati ATECO se presenti
        if (m.atecoData) {
          messageContent += ` [ATECO: ${m.atecoData.code || 'N/A'}]`;
        }
        
        // Aggiungi dati Risk se presenti
        if (m.riskData) {
          messageContent += ` [RISK DATA: ${JSON.stringify(m.riskData).substring(0, 100)}...]`;
        }
        
        // Aggiungi dati eventi rischio se presenti
        if (m.riskEventsData) {
          messageContent += ` [CATEGORIA: ${m.riskEventsData.categoryName}, EVENTI: ${m.riskEventsData.events.length}]`;
        }
        
        // Aggiungi descrizione rischio se presente
        if (m.riskDescriptionData) {
          const rd = m.riskDescriptionData;
          messageContent += ` [EVENTO SELEZIONATO: ${rd.eventCode} - ${rd.eventName}, CATEGORIA: ${rd.category}]`;
        }
        
        // Aggiungi dati visura se presenti
        if (m.visuraOutputData) {
          const vo = m.visuraOutputData;
          messageContent += ` [VISURA: P.IVA ${vo.partitaIva}, ATECO ${vo.codiceAteco}]`;
        }
        
        return messageContent;
      });
      
      // Crea un contesto completo della situazione attuale
      const contextSummary = [
        riskFlowStep !== 'idle' && `Fase corrente: ${riskFlowStep}`,
        selectedCategory && `Categoria selezionata: ${selectedCategory}`,
        selectedEvent && `Evento selezionato: ${selectedEvent}`,
        currentAssessmentQuestion && `Domanda assessment: Q${currentAssessmentQuestion}`,
        riskAssessmentData && `Dati assessment raccolti: ${Object.keys(riskAssessmentData).join(', ')}`
      ].filter(Boolean).join('; ');
      
      // Aggiungi TUTTO il contesto al messaggio utente
      const fullContext = chatSummary + "\nULTIMI MESSAGGI:\n" + lastMainMessages.join('\n');
      
      // Crea messaggio super chiaro per l'agente
      const enrichedUserMessage = `
${fullContext}

**INFORMAZIONI IMPORTANTI PER TE (AGENTE):**
${contextSummary || 'Nessun processo attivo'}

**LA DOMANDA DELL'UTENTE È:**
${inputText}

**RISPONDI CONSIDERANDO IL CONTESTO SOPRA. L'utente può vedere gli eventi 501-508 nella schermata principale e tu DEVI esserne consapevole.**`;
      
      // Debug: mostra cosa stiamo inviando all'agente
      console.log('[SYD AGENT] Messaggio arricchito inviato:', enrichedUserMessage);
      
      // Ottieni risposta da Gemini/fallback
      const sydResponse = await sydService.getResponse(
        enrichedUserMessage,
        riskFlowStep,
        selectedCategory,
        selectedEvent,
        currentAssessmentQuestion,
        lastMainMessages
      );
      
      setMessages(prev => [...prev, {
        id: `syd-${Date.now()}`,
        text: sydResponse,
        sender: 'syd',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Errore Syd Agent:', error);
      setMessages(prev => [...prev, {
        id: `syd-${Date.now()}`,
        text: 'Mi dispiace, ho avuto un problema tecnico. Riprova tra qualche istante.',
        sender: 'syd',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };


  const panelVariants = {
    closed: { x: '100%' },
    open: { x: 0 },
    minimized: { x: 'calc(100% - 60px)' }
  };

  return (
    <>
      {/* Toggle Button - Sempre visibile MA NON quando il panel è aperto */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`fixed right-4 bottom-24 z-40 p-3 rounded-full shadow-lg ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
          } text-white`}
        >
        <div className="relative">
          <Brain className="w-6 h-6" />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
          />
        </div>
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate={isMinimized ? "minimized" : "open"}
            exit="closed"
            variants={panelVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-96 z-50 shadow-2xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            } border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"
                  />
                </div>
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Syd Agent
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Senior Risk Advisor • Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs mr-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  ESC per chiudere
                </span>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                  title={isMinimized ? "Espandi" : "Minimizza"}
                >
                  {isMinimized ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all ${
                    isDarkMode ? 'hover:bg-red-600' : 'hover:bg-red-500'
                  }`}
                  title="Chiudi (ESC)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto h-[calc(100%-140px)] p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        {message.sender === 'syd' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Syd Agent</span>
                          </div>
                        )}
                        <div className={`p-3 rounded-xl ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : isDarkMode 
                              ? 'bg-gray-800 text-gray-100 border border-gray-700' 
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-right' : 'text-left'
                        } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className={`px-4 py-3 rounded-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Chiedi a Syd..."
                      className={`flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 text-white placeholder-gray-400' 
                          : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-xl transition-all ${
                        inputText.trim()
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-600' 
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Syd usa il metodo Socratico per guidarti • ISO 27001 | NIS2 | GDPR
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SydAgentPanel;