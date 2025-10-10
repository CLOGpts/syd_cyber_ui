import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useMessages, useRiskFlowStep, useRiskSelectedCategory, useRiskAssessmentData, useCurrentStepDetails } from '../../store';
import { useChatStore } from '../../store/useChatStore';
import { chatStore } from '../../store/chatStore';
import { SydAgentService } from '../../services/sydAgentService';
import {
  getSectorKnowledge,
  determineInteractionMode,
  generateSocraticQuestions,
  mapNaturalRiskToTechnical
} from '../../data/sectorKnowledge';
import {
  estimateATECOFromDescription,
  generateFirstAnalysis,
  generateProactiveOptions
} from '../../services/atecoEstimator';
import { trackEvent } from '../../services/sydEventTracker';

interface SydMessage {
  id: string;
  text: string;
  sender: 'syd' | 'user';
  timestamp: string;
}

interface SydAgentPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  width?: number;
  onResize?: (delta: number) => void;
  onResizeEnd?: () => void;
}

const SydAgentPanel: React.FC<SydAgentPanelProps> = ({
  isOpen: propIsOpen,
  onClose,
  width = 384,
  onResize,
  onResizeEnd
}) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Sync con prop esterna e RESET quando si apre
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);

      // RESET COMPLETO quando si apre Syd
      if (propIsOpen === true) {
        console.log('🧹 [SYD] Reset completo - nuova sessione');

        // Reset stati locali
        setMessages([]);
        setHasAskedInitial(false);
        setIsProcessingInitial(false);
        setShowProactiveOptions(false);
        setHasReceivedBusinessDescription(false);
        setCurrentSessionAnalysis(null);
        setInteractionMode('socratic');

        // NON tocchiamo localStorage per ora - solo memoria di sessione
        // Se vogliamo pulire anche localStorage:
        // localStorage.removeItem('sydFirstAnalysis');
      }
    }
  }, [propIsOpen]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<SydMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'technical' | 'socratic'>('socratic');
  const [hasAskedInitial, setHasAskedInitial] = useState(false);
  const [isProcessingInitial, setIsProcessingInitial] = useState(false);
  const [showProactiveOptions, setShowProactiveOptions] = useState(false);
  const [hasReceivedBusinessDescription, setHasReceivedBusinessDescription] = useState(false);
  const [currentSessionAnalysis, setCurrentSessionAnalysis] = useState<any>(null);
  const [justAskedForBusiness, setJustAskedForBusiness] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 🎯 USA I SELECTOR PER REAL-TIME SYNC!
  const mainMessages = useMessages(); // ✅ Questo si aggiorna automaticamente!
  const riskFlowStep = useRiskFlowStep();
  const riskSelectedCategory = useRiskSelectedCategory();
  const riskAssessmentData = useRiskAssessmentData();
  const currentStepDetails = useCurrentStepDetails(); // 🎯 Dettagli precisi dello step
  
  // Debug DETTAGLIATO per vedere cosa sta ricevendo
  useEffect(() => {
    console.log('🔥 [SYD AGENT REAL-TIME] Stato aggiornato:', {
      numeroMessaggi: mainMessages.length,
      primoMsg: mainMessages[0],
      ultimoMsg: mainMessages[mainMessages.length - 1],
      faseCorrente: riskFlowStep,
      categoriaSelezionata: riskSelectedCategory,
      dettagliStep: currentStepDetails
    });
  }, [mainMessages, riskFlowStep, riskSelectedCategory, riskAssessmentData, currentStepDetails]);

  // MONITORA MESSAGGI PER CATTURARE OUTPUT ATECO/VISURA
  useEffect(() => {
    const lastMessage = mainMessages[mainMessages.length - 1];

    // Controlla se è arrivato un output ATECO o Visura
    if (lastMessage?.visuraOutputData || lastMessage?.atecoData) {
      const data = lastMessage.visuraOutputData || lastMessage.atecoData;

      // Genera analisi dall'ATECO/Visura ricevuto
      if (data.codiceAteco || data.code) {
        const atecoCode = data.codiceAteco || data.code;
        const baseAnalysis = generateFirstAnalysis(atecoCode);

        // Crea FirstAnalysis completa con dati da ATECO/Visura
        const newAnalysis = {
          ...baseAnalysis,
          atecoEstimated: atecoCode,
          atecoDescription: data.descrizioneAttivita || data.description || baseAnalysis.sector,
          confidence: 1.0, // 100% da documento ufficiale
          businessDescription: data.descrizioneAttivita || '',
          timestamp: new Date().toISOString()
        };

        // SALVA SOLO IN MEMORIA DI SESSIONE (NO localStorage)
        setCurrentSessionAnalysis(newAnalysis);

        console.log('📊 [SYD] Memorizzata analisi da ATECO/Visura nella sessione:', newAnalysis);

        // Aggiungi messaggio di conferma
        if (!messages.some(m => m.text.includes('Ho analizzato il tuo ATECO'))) {
          const confirmText = `✅ **Ho analizzato il tuo documento!**\n\n` +
            `📊 **Settore:** ${newAnalysis.sector}\n` +
            `📍 **ATECO:** ${atecoCode}\n\n` +
            `Ora posso guidarti con precisione nel Risk Management.\n\n` +
            `**Come vuoi procedere?**\n` +
            `[1] Report completo dei rischi\n` +
            `[2] Fammi domande specifiche\n` +
            `[3] Impara le basi`;

          setMessages(prev => [...prev, {
            id: `syd-ateco-${Date.now()}`,
            text: confirmText,
            sender: 'syd',
            timestamp: new Date().toISOString()
          }]);

          setShowProactiveOptions(true);
        }
      }
    }
  }, [mainMessages]);
  
  // Deriva i valori dal flusso
  const selectedCategory = riskSelectedCategory;
  const selectedEvent = riskAssessmentData?.eventCode;
  const currentAssessmentQuestion = riskFlowStep.startsWith('assessment_q') 
    ? parseInt(riskFlowStep.replace('assessment_q', '')) 
    : undefined;
  const isDarkMode = false; // Rimuovo uso di isDarkMode per ora

  // Auto-scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chiudi con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (onClose) {
          onClose();
        } else {
          setIsOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Messaggio di benvenuto OLISTICO - sempre proattivo, mai lascia l'utente senza guida
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeText = "";

      // Usa SOLO l'analisi della sessione corrente, NON localStorage
      const { conversationalState, setConversationalState } = chatStore.getState();
      const savedAnalysis = currentSessionAnalysis; // Solo sessione corrente, NO localStorage!

      // Ottieni info sul settore se disponibile
      const sessionMeta = useAppStore.getState().sessionMeta;
      const sectorInfo = sessionMeta?.ateco ? getSectorKnowledge(sessionMeta.ateco) : null;

      // Determina modalità di interazione
      const mode = determineInteractionMode(inputText || '', messages.map(m => m.text));
      setInteractionMode(mode);

      // VISIONE OLISTICA: Controlla prima se abbiamo già un'analisi salvata VALIDA
      if (savedAnalysis && savedAnalysis.sector && savedAnalysis.atecoEstimated && savedAnalysis.confidence) {
        // Utente che torna - mostra analisi + 3 opzioni
        setConversationalState('idle');
        welcomeText = `🎯 **Bentornato!** Ho già in memoria la tua analisi iniziale.\n\n`;
        welcomeText += `📊 **La tua azienda:**\n`;
        welcomeText += `• Settore: ${savedAnalysis.sector}\n`;
        welcomeText += `• ATECO stimato: ${savedAnalysis.atecoEstimated} - ${savedAnalysis.atecoDescription}\n`;
        welcomeText += `• Confidenza: ${Math.round(savedAnalysis.confidence * 100)}%\n\n`;

        welcomeText += `⚡ **Quick Wins per te:**\n`;
        savedAnalysis.quickWins?.slice(0, 3).forEach((qw, i) => {
          welcomeText += `${i+1}. ${qw}\n`;
        });

        welcomeText += `\n🚀 **Cosa vuoi fare ora?**\n\n`;
        welcomeText += `📊 **[1] Continua con il Report** - Procedi con l'analisi dettagliata dei rischi\n`;
        welcomeText += `💬 **[2] Fammi domande** - Chiarimenti su normative, rischi, o il tuo settore\n`;
        welcomeText += `🎓 **[3] Scopri di più** - Come funziona il Risk Management nella pratica\n\n`;
        welcomeText += `_Digita 1, 2 o 3, oppure scrivi liberamente cosa ti serve._`;

        setShowProactiveOptions(true);
      } else if (sectorInfo) {
        // Ha ATECO ma non prima analisi - genera analisi veloce
        const baseAnalysis = generateFirstAnalysis(sessionMeta.ateco || '', sessionMeta.businessDescription);

        // Crea analisi completa con tutti i campi necessari
        const analysis = {
          ...baseAnalysis,
          atecoEstimated: sessionMeta.ateco || '',
          atecoDescription: sectorInfo.name,
          confidence: 1.0, // 100% se abbiamo ATECO preciso
          businessDescription: sessionMeta.businessDescription || '',
          timestamp: new Date().toISOString()
        };

        // Salva l'analisi SOLO nella sessione corrente
        setCurrentSessionAnalysis(analysis);

        welcomeText = `✨ **Benvenuto!** Ho analizzato la tua attività.\n\n`;
        welcomeText += `📊 **Settore identificato:** ${sectorInfo.name}\n`;
        welcomeText += `📍 **ATECO:** ${sessionMeta.ateco}\n\n`;

        welcomeText += `⚠️ **I tuoi rischi principali:**\n`;
        sectorInfo.rischiBase.slice(0, 3).forEach((risk, i) => {
          welcomeText += `${i+1}. ${risk}\n`;
        });

        welcomeText += `\n⚡ **3 Quick Wins immediati:**\n`;
        analysis.quickWins.slice(0, 3).forEach((qw, i) => {
          welcomeText += `${i+1}. ${qw}\n`;
        });

        welcomeText += `\n🚀 **Come posso aiutarti?**\n\n`;
        welcomeText += `📊 **[1] Vai al Report** - Analisi completa dei rischi\n`;
        welcomeText += `💬 **[2] Ho domande** - Parliamo del tuo business\n`;
        welcomeText += `🎓 **[3] Voglio capire** - Ti spiego il Risk Management\n\n`;
        welcomeText += `_Scegli un numero o dimmi direttamente cosa ti serve._`;

        setShowProactiveOptions(true);
      } else {
        // Nessuna info - MESSAGGIO INIZIALE PROFESSIONALE E INCLUSIVO
        welcomeText = `🎯 **Ciao! Sono Syd**, il tuo Risk Management Advisor digitale.\n\n`;
        welcomeText += `**Posso aiutarti in diversi modi:**\n\n`;
        welcomeText += `📊 **Analisi immediata** - Descrivi la tua attività e genero subito un'analisi dei rischi\n`;
        welcomeText += `📄 **Ho documenti** - Analizzo ATECO o visura camerale per un assessment preciso\n`;
        welcomeText += `💡 **Consulenza** - Rispondo a domande su normative, compliance, certificazioni\n`;
        welcomeText += `🛡️ **Risk Management** - Ti guido passo passo nel processo completo\n\n`;
        welcomeText += `**Per iniziare, dimmi:**\n`;
        welcomeText += `**Di cosa si occupa la tua azienda?**\n\n`;
        welcomeText += `_Oppure carica direttamente ATECO/visura dal pannello laterale_`;

        setHasAskedInitial(true); // IMPORTANTE: Marco che ho già chiesto!
        setJustAskedForBusiness(true); // Marco che sto aspettando la risposta sul business
        setConversationalState('idle');
      }

      setMessages([{
        id: 'welcome',
        text: welcomeText,
        sender: 'syd',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [messages.length]);

  // Gestione del resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      onResize?.(delta);
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      onResizeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, onResize, onResizeEnd]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userInput = inputText.trim();
    const { setConversationalState, conversationalState } = chatStore.getState();

    // 🔥 CONTROLLO CRITICO: Se abbiamo già un'analisi, NON rifarla!
    console.log('📊 [SYD] Analisi corrente:', currentSessionAnalysis);

    // GESTIONE 3-WAY FLOW
    if (showProactiveOptions && (userInput === '1' || userInput === '2' || userInput === '3')) {
      let responseText = '';

      switch(userInput) {
        case '1': // Continua con Report
          setConversationalState('assessing');
          responseText = `📊 **Perfetto! Procediamo con l'analisi dettagliata.**\n\n`;
          responseText += `Ora ti guiderò attraverso il processo di Risk Assessment.\n`;
          responseText += `Ti farò alcune domande per capire meglio la tua situazione.\n\n`;
          responseText += `**Usa il pannello principale per iniziare il Risk Management.**\n`;
          responseText += `Io sarò qui per spiegarti ogni passaggio! 💪`;
          setShowProactiveOptions(false);
          break;

        case '2': // Fammi domande
          setConversationalState('exploring');
          responseText = `💬 **Ottimo! Sono qui per rispondere a tutte le tue domande.**\n\n`;
          responseText += `Puoi chiedermi qualsiasi cosa su:\n`;
          responseText += `• I rischi del tuo settore\n`;
          responseText += `• Normative e compliance (GDPR, NIS2, etc.)\n`;
          responseText += `• Come proteggere la tua azienda\n`;
          responseText += `• Esempi pratici e casi reali\n\n`;
          responseText += `**Cosa ti interessa sapere?**`;
          setShowProactiveOptions(false);
          break;

        case '3': // Scopri di più
          setConversationalState('educating');
          responseText = `🎓 **Fantastico! Ti spiego il Risk Management in modo semplice.**\n\n`;
          responseText += `Il Risk Management è come avere un **sistema di allarme** per la tua azienda.\n\n`;
          responseText += `**In pratica significa:**\n`;
          responseText += `1. **Identificare** cosa potrebbe andare storto\n`;
          responseText += `2. **Valutare** quanto sarebbe grave\n`;
          responseText += `3. **Decidere** come proteggersi\n\n`;
          const analysis = getFirstAnalysis();
          if (analysis?.mainRisks?.length > 0) {
            responseText += `**Nel tuo caso specifico**, i rischi principali sono:\n`;
            analysis.mainRisks.slice(0, 3).forEach((risk, i) => {
              responseText += `• ${risk}\n`;
            });
            responseText += `\n`;
          }
          responseText += `**Vuoi che ti spieghi uno di questi aspetti nel dettaglio?**`;
          setShowProactiveOptions(false);
          break;
      }

      // Aggiungi risposta di Syd
      setMessages(prev => [...prev,
        {
          id: `user-${Date.now()}`,
          text: userInput,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: `syd-${Date.now()}`,
          text: responseText,
          sender: 'syd',
          timestamp: new Date().toISOString()
        }
      ]);
      setInputText('');
      return;
    }

    // COMPLETAMENTE RIMOSSO IL BLOCCO ROTTO
    // ORA L'AI DECIDE TUTTO BASANDOSI SUGLI ESEMPI!

    // GESTIONE SPECIFICA: UTENTE NON HA ATECO/VISURA
    const lowerInput = userInput.toLowerCase();
    const noATECO = (lowerInput.includes('non ho') && (lowerInput.includes('ateco') || lowerInput.includes('visura'))) ||
                    (lowerInput.includes('non abbiamo') && (lowerInput.includes('ateco') || lowerInput.includes('visura'))) ||
                    lowerInput.includes('senza ateco') ||
                    lowerInput.includes('senza visura');

    if (noATECO && currentSessionAnalysis) {
      // L'utente non ha ATECO MA abbiamo già analizzato la sua attività
      let responseText = `✅ **Nessun problema! Non serve l'ATECO ufficiale.**\n\n`;
      responseText += `Basandomi su quello che mi hai detto:\n`;
      responseText += `• Settore: **${currentSessionAnalysis.sector}**\n`;
      if (currentSessionAnalysis.businessDescription) {
        responseText += `• Attività: "${currentSessionAnalysis.businessDescription}"\n`;
      }
      responseText += `\n💡 **Posso usare un ATECO simile per l'analisi:**\n`;
      responseText += `📍 **${currentSessionAnalysis.atecoEstimated}** - ${currentSessionAnalysis.atecoDescription}\n\n`;
      responseText += `Questo ci permette di:\n`;
      responseText += `✓ Identificare i rischi del tuo settore\n`;
      responseText += `✓ Capire le normative applicabili\n`;
      responseText += `✓ Creare un piano d'azione concreto\n\n`;
      responseText += `**Vuoi procedere con questa analisi?**\n`;
      responseText += `[1] Sì, usiamo questo ATECO\n`;
      responseText += `[2] Preferisco caricare documenti ufficiali\n`;
      responseText += `[3] Fammi altre domande prima\n\n`;
      responseText += `_Oppure dimmi liberamente cosa preferisci._`;

      setMessages(prev => [...prev,
        {
          id: `user-${Date.now()}`,
          text: userInput,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: `syd-${Date.now()}`,
          text: responseText,
          sender: 'syd',
          timestamp: new Date().toISOString()
        }
      ]);

      setInputText('');
      setShowProactiveOptions(true);
      return;
    }

    // GESTIONE UTENTE CONFUSO O CHE NON SA
    const isConfused = lowerInput.includes('non so') ||
                      lowerInput.includes('non capisco') ||
                      lowerInput.includes('aiutami') ||
                      lowerInput.includes('cosa faccio') ||
                      lowerInput.includes('sono confuso');

    // SEGNALI INDIRETTI DI INESPERIENZA
    const seemsInexperienced = lowerInput.includes('cosa significa') ||
                               lowerInput.includes('puoi spiegare') ||
                               lowerInput.includes('non sono esperto') ||
                               lowerInput.includes('non sono pratico') ||
                               lowerInput.includes('ehm') ||
                               lowerInput.includes('boh') ||
                               (userInput.includes('?') && userInput.length < 50); // Domande brevi = incertezza

    // GESTIONE DOMANDE QUANDO ABBIAMO GIÀ ANALISI
    const isJustAsking = userInput.includes('?') &&
                         !isConfused &&
                         !seemsInexperienced &&
                         currentSessionAnalysis;

    if (isJustAsking) {
      // Sta solo chiedendo chiarimenti, NON rifare l'analisi
      console.log('💡 [SYD] Rispondo con contesto esistente:', currentSessionAnalysis.sector);

      // Aggiungi un messaggio che ricorda l'analisi esistente nel contesto
      // Questo verrà passato a Gemini/GPT per rispondere correttamente
    }

    if ((isConfused || seemsInexperienced) && currentSessionAnalysis) {
      // L'utente è confuso MA abbiamo già la sua analisi
      const analysis = currentSessionAnalysis;

      // Cambio modalità in socratica
      setInteractionMode('socratic');

      let responseText = `👋 **Perfetto! Sono qui per aiutarti.**\n\n`;

      // MESSAGGIO EMPATICO E RASSICURANTE
      if (isConfused) {
        responseText += `Non preoccuparti se non sei esperto! `;
        responseText += `**Ti spiego tutto in modo semplice**, senza termini tecnici.\n`;
        responseText += `Sarò al tuo fianco passo passo. 🤝\n\n`;
      } else if (seemsInexperienced) {
        responseText += `Ho notato che potresti preferire spiegazioni più semplici. `;
        responseText += `**Posso parlare in modo meno tecnico** se vuoi!\n`;
        responseText += `Dimmi pure se c'è qualcosa che non è chiaro. 💬\n\n`;
      }

      responseText += `So che ti occupi di **${analysis.sector}**.\n\n`;

      // SPIEGAZIONE SEMPLIFICATA
      responseText += `In parole semplici, per la tua attività dobbiamo capire:\n`;
      responseText += `• **Cosa potrebbe andare storto** (tipo: ${analysis.mainRisks[0]?.toLowerCase()})\n`;
      responseText += `• **Quanto ti costerebbe** se succedesse\n`;
      responseText += `• **Come evitarlo** prima che accada\n\n`;

      // SUGGERIMENTO ATECO/VISURA
      responseText += `💡 **Un consiglio pratico:**\n`;
      responseText += `Se hai un codice ATECO o una visura camerale, `;
      responseText += `**caricali dal pannello laterale** → otterrai un'analisi precisa che puoi:\n`;
      responseText += `• Leggere da solo\n`;
      responseText += `• Dare ai tuoi consulenti\n`;
      responseText += `• Usare con me per continuare\n\n`;

      responseText += `**Per ora, come preferisci procedere?**\n\n`;
      responseText += `📊 **[1] Analisi guidata** - Ti accompagno passo passo\n`;
      responseText += `💬 **[2] Fammi domande** - Chiarisci ogni dubbio\n`;
      responseText += `🎓 **[3] Parti dalle basi** - Ti spiego cos'è il Risk Management\n\n`;
      responseText += `_Scegli 1, 2 o 3, oppure dimmi cosa ti serve._`;

      setMessages(prev => [...prev,
        {
          id: `user-${Date.now()}`,
          text: userInput,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: `syd-${Date.now()}`,
          text: responseText,
          sender: 'syd',
          timestamp: new Date().toISOString()
        }
      ]);

      setInputText('');
      setShowProactiveOptions(true);
      return;
    }

    // GESTIONE UTENTE BLOCCATO GENERICAMENTE
    const seemsStuck = userInput.length < 20 && // Messaggio corto
                       !userInput.match(/^\d$/) && // Non è una scelta numerica
                       currentSessionAnalysis; // Abbiamo già un'analisi nella sessione

    if (seemsStuck && !showProactiveOptions && !isConfused && !seemsInexperienced) {
      const analysis = currentSessionAnalysis || getFirstAnalysis();

      let responseText = `🤔 **Vedo che non sei sicuro su come procedere.**\n\n`;

      // OFFERTA PROATTIVA DI SEMPLIFICAZIONE
      responseText += `Se preferisci, **posso spiegarti tutto in modo più semplice**.\n`;
      responseText += `Niente tecnicismi, solo esempi pratici! 💡\n\n`;

      if (analysis) {
        responseText += `Ricordo che lavori nel settore **${analysis.sector}**.\n\n`;
      }

      // SUGGERIMENTO DOCUMENTI
      responseText += `📄 **Suggerimento:** Se hai ATECO o visura, caricali dal pannello laterale per un'analisi più precisa.\n\n`;

      responseText += `**Come vuoi procedere?**\n\n`;
      responseText += `📊 **[1] Analisi completa** - Risk Assessment dettagliato\n`;
      responseText += `💬 **[2] Domande libere** - Chiedi qualsiasi cosa\n`;
      responseText += `🎓 **[3] Formazione base** - Cos'è il Risk Management\n\n`;
      responseText += `_Scegli 1, 2 o 3, oppure scrivi liberamente._`;

      setMessages(prev => [...prev,
        {
          id: `user-${Date.now()}`,
          text: userInput,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: `syd-${Date.now()}`,
          text: responseText,
          sender: 'syd',
          timestamp: new Date().toISOString()
        }
      ]);

      setInputText('');
      setShowProactiveOptions(true);
      return;
    }

    // Determina automaticamente la modalità basandosi sul messaggio
    const detectedMode = determineInteractionMode(userInput, messages.map(m => m.text));
    if (detectedMode !== interactionMode) {
      setInteractionMode(detectedMode);
      console.log(`🎯 Modalità cambiata in: ${detectedMode}`);
    }

    const userMessage: SydMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 🔥 TRACK USER MESSAGE SENT
    trackEvent('syd_message_sent', {
      message: inputText.substring(0, 200), // Limit 200 chars for storage
      messageLength: inputText.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Usa il servizio Syd Agent con Gemini
      const sydService = SydAgentService.getInstance();
      
      // Debug: mostra cosa c'è nella chat principale
      console.log('[SYD AGENT] Messaggi chat principale:', mainMessages);
      
      // IMPORTANTE: Crea un riepilogo ULTRA-PRECISO con currentStepDetails
      let chatSummary = "**CONTESTO ATTUALE DELL'APPLICAZIONE (L'UTENTE STA VEDENDO QUESTO):**\n\n";

      // 🔥 CRITICO: Se abbiamo già un'analisi, METTILA SUBITO NEL CONTESTO
      if (currentSessionAnalysis) {
        chatSummary += `⚠️ **IMPORTANTE: ABBIAMO GIÀ ANALIZZATO QUESTA AZIENDA!**\n`;
        chatSummary += `📊 **Analisi già effettuata nella sessione:**\n`;
        chatSummary += `• Settore: ${currentSessionAnalysis.sector}\n`;
        chatSummary += `• ATECO stimato: ${currentSessionAnalysis.atecoEstimated} - ${currentSessionAnalysis.atecoDescription}\n`;
        chatSummary += `• Descrizione attività: "${currentSessionAnalysis.businessDescription}"\n`;
        chatSummary += `• Rischi identificati: ${currentSessionAnalysis.mainRisks?.join(', ')}\n`;
        chatSummary += `• Normative: ${currentSessionAnalysis.regulations?.join(', ')}\n`;
        chatSummary += `\n⚠️ **NON RIFARE L'ANALISI! USA QUESTI DATI ESISTENTI!**\n\n`;
      }

      // Se abbiamo dettagli precisi dello step, usali!
      if (currentStepDetails) {
        chatSummary += `📍 **SCHERMATA ATTUALE PRECISA:**\n`;

        if (currentStepDetails.questionNumber) {
          chatSummary += `• DOMANDA ${currentStepDetails.questionNumber} di ${currentStepDetails.totalQuestions}\n`;
          chatSummary += `• Campo: ${currentStepDetails.fieldName}\n`;
          chatSummary += `• Testo domanda: "${currentStepDetails.questionText}"\n`;

          if (currentStepDetails.helpText) {
            chatSummary += `• Suggerimento: ${currentStepDetails.helpText}\n`;
          }

          chatSummary += `• OPZIONI DISPONIBILI:\n`;
          currentStepDetails.options?.forEach((opt, i) => {
            chatSummary += `  ${i+1}. ${opt.label}`;
            if (opt.description) chatSummary += ` - ${opt.description}`;
            chatSummary += `\n`;
          });
        } else {
          chatSummary += `• Step: ${currentStepDetails.stepId}\n`;
          if (currentStepDetails.categoryName) {
            chatSummary += `• Categoria selezionata: ${currentStepDetails.categoryName}\n`;
          }
        }

        if (currentStepDetails.eventCode) {
          chatSummary += `• Evento in analisi: ${currentStepDetails.eventCode}\n`;
        }

        chatSummary += `\n`;
      }

      // Aggiungi info generali di supporto
      chatSummary += `• Messaggi nella chat principale: ${mainMessages.length}\n`;
      chatSummary += `• Fase Risk Management: ${riskFlowStep}\n`;

      // Se ci sono eventi visibili nella schermata
      if (mainMessages.some(m => m.type === 'risk-events')) {
        chatSummary += `• L'utente sta visualizzando una lista di eventi di rischio\n`;
      }
      
      // Aggiungi info sui file caricati
      const uploadedFiles = useAppStore.getState().uploadedFiles;
      if (uploadedFiles.length > 0) {
        chatSummary += `• File caricati: ${uploadedFiles.map(f => f.name).join(', ')}\n`;
      }

      // Aggiungi info sul settore e modalità SOLO se pertinente
      // NON includiamo sessionMeta se l'utente sta facendo una domanda generica
      const sessionMeta = useAppStore.getState().sessionMeta;

      // Include ATECO solo se:
      // 1. È stato caricato un file con ATECO
      // 2. O l'utente ha esplicitamente fornito un ATECO nella conversazione corrente
      const shouldIncludeAteco = uploadedFiles.some(f =>
        f.type === 'ateco' || f.type === 'visura'
      ) || mainMessages.some(m =>
        m.atecoData || m.visuraOutputData
      );

      if (sessionMeta?.ateco && shouldIncludeAteco) {
        const sectorInfo = getSectorKnowledge(sessionMeta.ateco);
        if (sectorInfo) {
          chatSummary += `\n📊 **INFORMAZIONI SETTORE:**\n`;
          chatSummary += `• Settore: ${sectorInfo.name}\n`;
          chatSummary += `• ATECO: ${sessionMeta.ateco}\n`;
          chatSummary += `• Rischi tipici: ${sectorInfo.rischiBase.slice(0, 3).join(', ')}\n`;
        }
      }

      chatSummary += `\n🎯 **MODALITÀ INTERAZIONE:** ${interactionMode === 'technical' ? 'TECNICA (esperto)' : 'SOCRATICA (guidata)'}\n`;

      if (interactionMode === 'socratic') {
        chatSummary += `IMPORTANTE: Usa linguaggio SEMPLICE, esempi CONCRETI, evita tecnicismi.\n`;
        chatSummary += `L'utente potrebbe non conoscere termini come Basel, GDPR, compliance.\n`;
        chatSummary += `Traduci tutto in situazioni pratiche del suo lavoro quotidiano.\n`;
      } else {
        chatSummary += `L'utente è ESPERTO. Usa terminologia tecnica, riferimenti normativi, KRI/KPI.\n`;
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
      
      // Aggiungi la conversazione precedente con Syd
      let sydConversationHistory = '';
      if (messages.length > 0) {
        sydConversationHistory = '\n\n=== CONVERSAZIONE PRECEDENTE CON SYD (IN QUESTA SESSIONE) ===\n';
        // Prendi gli ultimi 30 messaggi della conversazione con Syd (circa 15 scambi)
        const recentSydMessages = messages.slice(-30);
        recentSydMessages.forEach(msg => {
          const sender = msg.sender === 'user' ? 'Utente' : 'Syd';
          sydConversationHistory += `${sender}: ${msg.text}\n`;
        });
        sydConversationHistory += '\n=== FINE CONVERSAZIONE PRECEDENTE ===\n';
      }

      // Crea messaggio super chiaro per l'agente
      const enrichedUserMessage = `
${fullContext}

${sydConversationHistory}

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
      
      const sydResponseMessage = {
        id: `syd-${Date.now()}`,
        text: sydResponse,
        sender: 'syd',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, sydResponseMessage]);

      // 🔥 TRACK SYD RESPONSE RECEIVED
      trackEvent('syd_message_received', {
        response: sydResponse.substring(0, 200), // Limit 200 chars for storage
        responseLength: sydResponse.length,
        timestamp: new Date().toISOString()
      });
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
      {/* Rimuoviamo il bottone floating - ora è nella sidebar */}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate={isMinimized ? "minimized" : "open"}
            exit="closed"
            variants={panelVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              fixed right-0 z-50 shadow-2xl
              bg-gradient-to-b from-slate-900 to-slate-950
              border-l border-sky-500/20
              top-[5rem]
              bottom-4
              rounded-l-xl
              transition-all duration-300
            `}
            style={{
              width: width ? `${width}px` : '384px'
            }}
          >
            {/* Resize Handle - Bordo sinistro */}
            <div
              className={`
                absolute left-0 top-0 bottom-0 w-1 cursor-col-resize
                hover:bg-sky-500/50 transition-colors duration-200
                ${isDragging ? 'bg-sky-500/50' : 'bg-transparent'}
              `}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -inset-x-1" />
            </div>

            {/* Toggle Button - Come la sidebar ma a destra */}
            <button
              onClick={() => onClose ? onClose() : setIsOpen(false)}
              className="
                absolute -left-4 top-8 z-30
                bg-slate-900 border border-sky-500/30
                rounded-full p-2 shadow-lg
                hover:bg-slate-800 transition-all duration-200
                hover:scale-110 hover:shadow-sky-500/20
              "
            >
              <ChevronRight size={16} className="text-sky-400" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sky-500/20 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    Syd Agent
                  </h3>
                  <p className="text-xs text-sky-300">
                    Senior Risk Advisor • Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs mr-2 text-gray-400">
                  ESC per chiudere
                </span>
                <button
                  onClick={() => onClose ? onClose() : setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
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
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            <span className="text-xs text-sky-300">Syd Agent</span>
                          </div>
                        )}
                        <div className={`p-3 rounded-xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                            : 'bg-slate-800/50 text-gray-100 border border-slate-700/50 backdrop-blur-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-right' : 'text-left'
                        } text-gray-500`}>
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
                      <div className="px-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-2 h-2 bg-sky-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-2 h-2 bg-sky-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-2 h-2 bg-sky-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-sky-500/20 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Chiedi a Syd..."
                      className="flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-800/50 text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-xl transition-all ${
                        inputText.trim()
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/20'
                          : 'bg-slate-800/30 text-gray-600'
                      }`}
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
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
