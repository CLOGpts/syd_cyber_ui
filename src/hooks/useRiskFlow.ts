import { useCallback, useState } from 'react';
import { useChatStore } from '../store';
import { useAppStore } from '../store/useStore';
import { chatStore } from '../store/chatStore';

// Backend URL configurabile da environment variable
const BACKEND_URL = import.meta.env.VITE_RISK_API_BASE ||
                    import.meta.env.VITE_API_BASE ||
                    'https://web-production-3373.up.railway.app';

// Funzione VLOOKUP per il campo controllo (colonna X)
const updateDescrizioneControllo = (controlloValue: string): string => {
  const mappature: Record<string, { titolo: string; descrizione: string }> = {
    '++': {
      titolo: 'Adeguato',
      descrizione: 'Il sistema di controllo interno è efficace ed adeguato (controlli 1 e 2 sono attivi e consolidati)'
    },
    '+': {
      titolo: 'Sostanzialmente adeguato',
      descrizione: 'Alcune correzioni potrebbero rendere soddisfacente il sistema di controllo interno (controlli 1 e 2 presenti ma parzialmente strutturati)'
    },
    '-': {
      titolo: 'Parzialmente Adeguato',
      descrizione: 'Il sistema di controllo interno deve essere migliorato e il processo dovrebbe essere più strettamente controllato (controlli 1 e 2 NON formalizzati)'
    },
    '--': {
      titolo: 'Non adeguato / assente',
      descrizione: 'Il sistema di controllo interno dei processi deve essere riorganizzato immediatamente (livelli di controllo 1 e 2 NON attivi)'
    }
  };
  
  if (mappature[controlloValue]) {
    return `✓ ${mappature[controlloValue].titolo}\n${mappature[controlloValue].descrizione}`;
  }
  return "Seleziona un livello di controllo per vedere la descrizione";
};

// WARFARE: Process isolation - gestito ora tramite store centrale
// Il lock è gestito da chatStore.isProcessLocked() e setRiskProcessLocked()
// NO PIÙ VARIABILI GLOBALI per evitare race conditions tra tab/sessioni

// Genera session ID sicuro e univoco per ogni sessione
const generateSessionId = (): string => {
  // Usa crypto.randomUUID se disponibile (browser moderni)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `session_${crypto.randomUUID()}`;
  }
  // Fallback più sicuro con multiple sorgenti di entropia
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const performanceNow = typeof performance !== 'undefined' ? performance.now() : 0;
  return `session_${timestamp}_${random1}${random2}_${performanceNow.toString(36)}`;
};

// Nota: Questo è generato una volta per import del modulo
// Per sessioni multiple, dovremmo generarlo dinamicamente
const SESSION_ID = generateSessionId();

// VALIDAZIONE INPUT: Funzioni di sanitizzazione sicure
const sanitizeUserInput = (input: string): string => {
  // Rimuovi caratteri di controllo e trim
  let sanitized = input.trim();

  // Rimuovi caratteri pericolosi per prevenire injection
  sanitized = sanitized.replace(/[<>\"'`]/g, '');

  // Limita lunghezza per prevenire overflow
  sanitized = sanitized.substring(0, 1000);

  return sanitized;
};

const validateEventCode = (code: string): string | null => {
  // Sanitizza prima
  const sanitized = sanitizeUserInput(code);

  // Valida formato: deve essere esattamente 3 cifre
  if (!/^\d{3}$/.test(sanitized)) {
    return null;
  }

  // Valida range: codici evento tipicamente 100-999
  const codeNum = parseInt(sanitized, 10);
  if (codeNum < 100 || codeNum > 999) {
    return null;
  }

  return sanitized;
};

const validateEventIndex = (input: string, maxIndex: number): number | null => {
  // Sanitizza prima
  const sanitized = sanitizeUserInput(input);

  // Deve essere un numero
  if (!/^\d+$/.test(sanitized)) {
    return null;
  }

  const index = parseInt(sanitized, 10) - 1; // Converti a 0-based

  // Valida range
  if (index < 0 || index >= maxIndex) {
    return null;
  }

  return index;
};

// WARFARE: State validation
const VALID_TRANSITIONS: Record<string, string[]> = {
  'idle': ['waiting_category'],
  'waiting_category': ['waiting_event', 'idle'],
  'waiting_event': ['waiting_choice', 'waiting_event_change_confirmation', 'waiting_category', 'idle'],
  'waiting_event_change_confirmation': ['waiting_choice', 'waiting_event', 'idle'],
  'waiting_choice': ['assessment_q1', 'waiting_event', 'idle'],
  'assessment_q1': ['assessment_q2', 'idle'],
  'assessment_q2': ['assessment_q3', 'assessment_q1', 'idle'],
  'assessment_q3': ['assessment_q4', 'assessment_q2', 'idle'],
  'assessment_q4': ['assessment_q5', 'assessment_q3', 'idle'],
  'assessment_q5': ['assessment_q6', 'assessment_q4', 'idle'],
  'assessment_q6': ['assessment_q7', 'assessment_q5', 'idle'],
  'assessment_q7': ['assessment_q8', 'assessment_q6', 'idle'], // ✅ BACK OK: può tornare a Q6
  'assessment_q8': ['assessment_review', 'assessment_q7', 'idle'], // ✅ BACK OK: può tornare a Q7
  'assessment_complete': ['completed', 'idle'],
  'completed': ['idle'] // 🔴 TALIBAN: REPORT FINALE = STOP TOTALE
};

const isValidTransition = (from: string, to: string): boolean => {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) {
    console.error('❌ WARFARE: Unknown state:', from);
    return false;
  }
  const valid = allowed.includes(to);
  if (!valid) {
    console.error('❌ WARFARE: Invalid transition', from, '->', to);
  }
  return valid;
};

export const useRiskFlow = () => {
  const {
    messages,
    addMessage,
    riskFlowStep,
    riskSelectedCategory,
    riskAvailableEvents,
    riskAssessmentData,
    riskAssessmentFields,
    setRiskFlowState,
    pushRiskHistory,
    popRiskHistory,
    canGoBack,
    clearRiskHistory,
    setRiskAssessmentData,
    setRiskAssessmentFields,
    setCurrentStepDetails,
    riskFlowHistory,
    selectedEventCode,
    pendingEventCode,
    setSelectedEventCode,
    setPendingEventCode,
    clearEventSelection,
    removeEventDescriptionMessages
  } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  // STEP 1: Mostra le 7 categorie
  const startRiskFlow = useCallback(async () => {
    console.log('🚀 START RISK FLOW - Called at:', new Date().toISOString());
    console.log('Current step before:', riskFlowStep);


    // Reset any previous state to ensure clean start
    if (riskFlowStep !== 'idle') {
      console.log('⚠️ Risk flow already in progress, resetting...');
      clearRiskHistory(); // IMPORTANTE: Pulisci history prima del reset
      clearEventSelection(); // 🎯 PULIZIA EVENTI MULTIPLI
      setRiskFlowState('idle');
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Timeout cleanup rimosso - processId non esiste più

    // IMPORTANTE: Pulisci sempre l'history all'inizio di un nuovo flow
    clearRiskHistory();
    pushRiskHistory('waiting_category', {});
    setRiskFlowState('waiting_category');

    // Feedback immediato per l'utente
    setIsSydTyping(true);

    // Aggiorna i dettagli dello step corrente
    setCurrentStepDetails({
      stepId: 'waiting_category',
      questionText: 'Seleziona una categoria di rischio',
      fieldName: 'Categoria',
      options: [
        { value: 'clienti', label: 'Clienti', description: 'Rischi relativi a clienti e prodotti' },
        { value: 'danni', label: 'Danni', description: 'Danni fisici a persone o strutture' },
        { value: 'sistemi', label: 'Sistemi', description: 'Interruzione attività e sistemi' },
        { value: 'dipendenti', label: 'Dipendenti', description: 'Pratiche di lavoro e sicurezza' },
        { value: 'produzione', label: 'Produzione', description: 'Problemi di produzione o consegna' },
        { value: 'frodi interne', label: 'Frodi Interne', description: 'Frodi commesse internamente' },
        { value: 'frodi esterne', label: 'Frodi Esterne', description: 'Frodi da soggetti esterni' }
      ]
    });

    // Piccolo delay per garantire che l'UI sia pronta
    setTimeout(() => {
      // Invece di mostrare testo, mostra le card interattive
      addMessage({
        id: `risk-categories-${Date.now()}`,
        text: '', // Testo vuoto, le card verranno renderizzate da MessageBubble
        type: 'risk-categories',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });

      setIsSydTyping(false);
      console.log('✅ Risk categories message added');
    }, 200);

  }, [addMessage, setRiskFlowState, setIsSydTyping]);

  // STEP 2: Mostra TUTTI gli eventi della categoria (COME EXCEL!)
  const processCategory = useCallback(async (userInput: string) => {
    console.log('📂 CATEGORIA SCELTA:', userInput);
    const input = userInput.toLowerCase();

    // CLEAR ALL NON-CATEGORY MESSAGES FIRST to ensure clean state
    chatStore.setState(state => {
      if (state.messages.some(m => m.type !== 'risk-categories')) {
        console.log('🧹 CLEANING: Removing non-category messages before processing new category');
        return {
          ...state,
          messages: state.messages.filter(m => m.type === 'risk-categories')
        };
      }
      return state;
    });

    setIsSydTyping(true);

    // VALIDATION: Ensure we are in a valid state to process category
    chatStore.setState(state => {
      if (state.riskFlowStep !== 'waiting_category' && state.riskFlowStep !== 'idle') {
        console.warn('⚠️ WARNING: processCategory called in invalid state:', state.riskFlowStep);
        // Force reset to waiting_category
        return {
          ...state,
          riskFlowStep: 'waiting_category'
        };
      }
      return state;
    });

    // Mappa input -> chiave backend (RIPRISTINATA CON I NOMI EXCEL ORIGINALI)
    const mappaCategorie: Record<string, string> = {
      "danni": "Damage_Danni",
      "sistemi": "Business_disruption",
      "dipendenti": "Employment_practices_Dipendenti",
      "produzione": "Execution_delivery_Problemi_di_produzione_o_consegna",
      "clienti": "Clients_product_Clienti",
      "frodi interne": "Internal_Fraud_Frodi_interne",
      "frodi esterne": "External_fraud_Frodi_esterne"
    };
    
    // Mappa per i gradient delle categorie (stessi delle card)
    const categoryGradients: Record<string, string> = {
      "danni": "from-red-500 to-orange-500",
      "sistemi": "from-blue-500 to-cyan-500",
      "dipendenti": "from-purple-500 to-pink-500",
      "produzione": "from-green-500 to-emerald-500",
      "clienti": "from-yellow-500 to-amber-500",
      "frodi interne": "from-indigo-500 to-purple-500",
      "frodi esterne": "from-rose-500 to-red-500"
    };
    
    let categoryKey = '';
    let categoryName = '';
    
    // Trova la categoria
    for (const [key, value] of Object.entries(mappaCategorie)) {
      if (input.includes(key.split(' ')[0])) {
        categoryKey = value;
        categoryName = key.toUpperCase();
        break;
      }
    }
    
    if (!categoryKey) {
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❓ Scrivi una categoria valida: clienti, danni, sistemi, dipendenti, produzione, frodi interne, frodi esterne',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      setIsSydTyping(false);
      return;
    }
    
    try {
      // CHIAMA BACKEND PER TUTTI GLI EVENTI
      console.log('🔍 Calling Risk API:', `${BACKEND_URL}/events/${categoryKey}`);

      // Add timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${BACKEND_URL}/events/${categoryKey}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ Risk API error:', response.status, response.statusText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.events)) {
        throw new Error('Invalid response format: events array expected');
      }

      console.log('✅ Risk API response:', data);
      
      // CLEAR SELECTION STATE before setting new category
      clearEventSelection();

      // SALVA TUTTI GLI EVENTI
      setRiskFlowState('waiting_event', categoryKey, data.events || []);
      pushRiskHistory('waiting_event', { category: categoryKey });

      // Aggiorna i dettagli dello step con gli eventi disponibili
      setCurrentStepDetails({
        stepId: 'waiting_event',
        categoryName: categoryName,
        questionText: `Seleziona un evento di rischio dalla categoria ${categoryName}`,
        fieldName: 'Evento',
        eventCode: null
      });

      // Trova il gradient giusto per la categoria
      let categoryForGradient = '';
      for (const [key, value] of Object.entries(mappaCategorie)) {
        if (value === categoryKey) {
          categoryForGradient = key;
          break;
        }
      }
      const gradient = categoryGradients[categoryForGradient] || 'from-gray-500 to-gray-600';
      
      // INVIA LE CARD INVECE DEL TESTO
      addMessage({
        id: `risk-events-${Date.now()}`,
        text: '', // Nessun testo, useremo le card
        type: 'risk-events',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        riskEventsData: {
          events: data.events || [],
          categoryName: categoryName,
          categoryGradient: gradient
        }
      });
      
      setRiskFlowState('waiting_event', categoryKey, data.events);
      
    } catch (error: any) {
      console.error('Error loading events:', error);

      // Determine error type and provide appropriate feedback
      let errorMessage = '❌ Errore nel caricamento eventi. ';

      if (error.name === 'AbortError') {
        errorMessage += 'La richiesta ha impiegato troppo tempo. Riprova.';
      } else if (!navigator.onLine) {
        errorMessage += 'Connessione internet assente.';
      } else if (error.message?.includes('API returned')) {
        errorMessage += `Il server ha risposto con un errore: ${error.message}`;
      } else if (error.message?.includes('Invalid response format')) {
        errorMessage += 'Formato risposta non valido dal server.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage += 'Impossibile contattare il backend. Verifica che sia attivo.';
      } else {
        errorMessage += error.message || 'Errore sconosciuto.';
      }

      addMessage({
        id: `risk-error-${Date.now()}`,
        text: errorMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });

      // Reset to safe state
      setRiskFlowState('waiting_category');
    }
    
    setIsSydTyping(false);
  }, [addMessage, setIsSydTyping, setRiskFlowState, clearEventSelection]);

  // STEP 3: Mostra descrizione dell'evento scelto (VLOOKUP di Excel!)
  const showEventDescription = useCallback(async (eventCode: string, forceReload: boolean = false) => {
    console.log('📋 RECUPERO DESCRIZIONE PER:', eventCode, 'Force:', forceReload);

    // Se forceReload è true, salta i controlli e ricarica direttamente
    if (!forceReload) {
      // 🎯 CONTROLLO BLOCCO SELEZIONE EVENTI MULTIPLI (solo se non è un force reload)
      if (selectedEventCode && selectedEventCode !== eventCode) {
        console.log('⚠️ EVENTO GIÀ SELEZIONATO:', selectedEventCode, '- Richiesta conferma per:', eventCode);

        // Salva l'evento che l'utente vuole selezionare
        setPendingEventCode(eventCode);

        // Chiedi conferma per cambiare
        addMessage({
          id: `event-change-confirmation-${Date.now()}`,
          text: `⚠️ Hai già selezionato l'evento **${selectedEventCode}**.
                 Vuoi cambiare e selezionare l'evento **${eventCode}** invece?

                 Rispondi "**sì**" per cambiare o "**no**" per mantenere l'evento corrente.`,
          type: 'system',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });

        setRiskFlowState('waiting_event_change_confirmation');
        return;
      }
    }

    setIsSydTyping(true);

    try {
      // CHIAMA BACKEND PER LA DESCRIZIONE
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${BACKEND_URL}/description/${encodeURIComponent(eventCode)}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from description API');
      }
      
      // PREPARA I DATI PER LA CARD
      const eventName = data.name || eventCode;
      const severity = data.severity || 'medium';
      
      // INVIA LA CARD INVECE DEL TESTO
      addMessage({
        id: `risk-desc-${Date.now()}`,
        text: '',  // Nessun testo, useremo la card
        type: 'risk-description',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        riskDescriptionData: {
          eventCode: eventCode,
          eventName: eventName,
          category: riskSelectedCategory || '',
          severity: severity,
          description: data.description || 'Descrizione completa dell\'evento di rischio secondo le best practice di risk management.',
          probability: data.probability || 'Media',
          impact: data.impact || 'Significativo',
          controls: data.controls || 'Standard',
          monitoring: data.monitoring || 'Trimestrale'
        }
      });
      
      // Salva i dati dell'evento per l'assessment
      setRiskAssessmentData({
        eventCode: eventCode,
        category: riskSelectedCategory || ''
      });

      // 🎯 BLOCCO SELEZIONE EVENTI MULTIPLI: Marca l'evento come selezionato
      setSelectedEventCode(eventCode);
      console.log('✅ EVENTO SELEZIONATO E BLOCCATO:', eventCode);

      // Aggiorna currentStepDetails per Syd Agent
      setCurrentStepDetails({
        stepId: 'waiting_choice',
        eventCode: eventCode,
        categoryName: riskSelectedCategory,
        questionText: `Vuoi procedere con la valutazione del rischio per l'evento ${eventCode}?`
      });

      // Passa allo stato di attesa conferma per iniziare le 5 domande
      setRiskFlowState('waiting_choice', riskSelectedCategory, riskAvailableEvents);
      
    } catch (error: any) {
      console.error('Error loading event description:', error);

      let errorMessage = '❌ Errore nel caricamento della descrizione. ';

      if (error.name === 'AbortError') {
        errorMessage += 'Timeout della richiesta.';
      } else if (!navigator.onLine) {
        errorMessage += 'Connessione internet assente.';
      } else if (error.message?.includes('API returned')) {
        errorMessage += error.message;
      } else if (error.message?.includes('Invalid response format')) {
        errorMessage += 'Formato risposta non valido.';
      } else {
        errorMessage += 'Riprova più tardi.';
      }

      addMessage({
        id: `risk-error-${Date.now()}`,
        text: errorMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    }
    
    setIsSydTyping(false);
  }, [addMessage, setIsSydTyping, setRiskFlowState, riskSelectedCategory, riskAvailableEvents,
      selectedEventCode, setPendingEventCode, setSelectedEventCode]);

  // ELIMINATO reset timeout - LOCK FOREVER!
  const resetProcessTimeout = useCallback(() => {
    // NON FARE NULLA - niente più timeout
    console.log('🔒 LOCK PERMANENTE - nessun timeout');
  }, []);

  // GESTIONE MESSAGGI - SEMPLICE COME EXCEL!
  const handleUserMessage = useCallback(async (message: string) => {
    // IMPORTANTE: Usa getState() per avere lo stato ATTUALE, non quello dal closure!
    const currentStep = chatStore.getState().riskFlowStep;
    console.log('💬 MESSAGGIO:', message, 'STEP ATTUALE:', currentStep);
    const msg = message.toLowerCase();


    // STEP 0: Se idle e dice risk
    if (currentStep === 'idle' && (msg.includes('risk') || msg.includes('rischi'))) {
      await startRiskFlow();
      return;
    }

    // STEP 1: Aspetta categoria
    if (currentStep === 'waiting_category') {
      await processCategory(message);
      return;
    }

    // STEP 2: Aspetta selezione evento (numero o codice)
    if (currentStep === 'waiting_event') {
      // VALIDATION: Ensure we have events available
      if (!riskAvailableEvents || riskAvailableEvents.length === 0) {
        console.warn('⚠️ WARNING: No events available in waiting_event state');
        addMessage({
          id: `risk-no-events-${Date.now()}`,
          text: '❌ Nessun evento disponibile. Seleziona prima una categoria.',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        return;
      }

      let eventoSelezionato = null;
      let eventCode = null;
      
      // Se è un codice a 3 cifre (es: "101", "505", "501") - PRIMA di controllare numero singolo
      const validatedCode = validateEventCode(msg);
      if (validatedCode) {
        const codice = validatedCode; // Ora è sanitizzato e validato

        // Gli eventi possono essere stringhe tipo "**[501]** Nome evento" o oggetti {code: "501", name: "..."}
        eventoSelezionato = riskAvailableEvents.find(e => {
          if (typeof e === 'string') {
            // Cerca il pattern [501] nella stringa
            return e.includes(`[${codice}]`);
          } else if (e && typeof e === 'object' && 'code' in e) {
            return e.code === codice;
          }
          return false;
        });

        // Se trovato, mostra la descrizione
        if (eventoSelezionato) {
          await showEventDescription(codice);
          return;
        }
      }
      // Se è un numero puro (es: "5") - indice della lista
      else {
        const validatedIndex = validateEventIndex(msg, riskAvailableEvents.length);
        if (validatedIndex !== null) {
          eventoSelezionato = riskAvailableEvents[validatedIndex];
          // Estrai il codice dall'evento
          if (typeof eventoSelezionato === 'string') {
            const match = eventoSelezionato.match(/\[(\d{3})\]/);
            if (match) {
              eventCode = match[1];
            }
          }
        }
        // Se non è né codice né indice valido, cerca match nel nome
        else {
          const sanitized = sanitizeUserInput(msg).toLowerCase();
          eventoSelezionato = riskAvailableEvents.find(e => {
            if (typeof e === 'string') {
              return e.toLowerCase().includes(sanitized);
            } else if (e && typeof e === 'object' && 'name' in e) {
              return e.name.toLowerCase().includes(sanitized);
            }
            return false;
          });
        }
      }
      
      if (eventoSelezionato || eventCode) {
        // IMPORTANTE: Passa solo il CODICE, non l'oggetto completo!
        if (!eventCode) {
          if (typeof eventoSelezionato === 'string') {
            const match = eventoSelezionato.match(/\[(\d{3})\]/);
            eventCode = match ? match[1] : eventoSelezionato;
          } else {
            eventCode = eventoSelezionato.code;
          }
        }
        await showEventDescription(eventCode);
      } else {
        addMessage({
          id: `risk-invalid-${Date.now()}`,
          text: `❓ Non trovato. Scrivi un numero da 1 a ${riskAvailableEvents.length} o un codice evento (es: 505)`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    // 🎯 STEP 2.5: Gestione conferma cambio evento
    if (riskFlowStep === 'waiting_event_change_confirmation') {
      if (msg.toLowerCase().includes('sì') || msg.toLowerCase().includes('si')) {
        console.log('✅ UTENTE CONFERMA CAMBIO EVENTO');

        if (!pendingEventCode) {
          console.error('❌ ERRORE: pendingEventCode è null');
          addMessage({
            id: `error-pending-${Date.now()}`,
            text: '❌ Errore interno. Riprova a selezionare un evento.',
            sender: 'agent',
            timestamp: new Date().toISOString()
          });
          setRiskFlowState('waiting_event');
          return;
        }

        // 🧹 PULIZIA: Rimuovi i messaggi della descrizione precedente
        removeEventDescriptionMessages();
        console.log('🗑️ MESSAGGI DESCRIZIONE PRECEDENTE RIMOSSI');

        // 🔄 CAMBIO: Seleziona il nuovo evento
        const newEventCode = pendingEventCode;
        setPendingEventCode(null);

        // Mostra descrizione del nuovo evento
        await showEventDescription(newEventCode);

      } else if (msg.toLowerCase().includes('no')) {
        console.log('❌ UTENTE ANNULLA CAMBIO EVENTO');

        // Mantieni l'evento corrente, torna alla selezione eventi
        setPendingEventCode(null);

        addMessage({
          id: `keep-current-event-${Date.now()}`,
          text: `✅ Mantieni l'evento corrente **${selectedEventCode}**.`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });

        setRiskFlowState('waiting_event');
      } else {
        // Risposta non valida
        addMessage({
          id: `invalid-confirmation-${Date.now()}`,
          text: '❓ Risposta non valida. Scrivi "**sì**" per cambiare evento o "**no**" per mantenere quello attuale.',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    // STEP 3.5: Conferma per iniziare le 5 domande assessment
    if (riskFlowStep === 'waiting_choice') {
      if (msg.toLowerCase().includes('sì') || msg.toLowerCase().includes('si')) {
        // ANTIFRAGILE: Atomic check-and-lock operation
        const wasLocked = chatStore.getState().isProcessLocked();
        if (wasLocked) {
          console.warn('🔒 ANTIFRAGILE: Process already locked, cannot start assessment');
          addMessage({
            id: `risk-locked-${Date.now()}`,
            text: '⚠️ Un assessment è già in corso. Completa quello attuale prima di iniziarne uno nuovo.',
            sender: 'agent',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Atomic lock operation
        chatStore.setState(state => {
          if (!state.isProcessLocked || !state.isProcessLocked()) {
            console.log('🔒 LOCKING: Starting assessment process');
            // Usa setRiskProcessLocked se esiste come metodo
            if (state.setRiskProcessLocked) {
              state.setRiskProcessLocked(true);
            }
            return state;
          }
          return state;
        });
        console.log('🔒 ANTIFRAGILE LOCKDOWN ATTIVATO: Assessment iniziato, processo bloccato');

        // NO TIMEOUT! Lock rimane attivo FOREVER
        console.log('🔒 LOCK ATTIVATO - Nessun timeout, rimane bloccato fino a completamento');

        // Carica i campi assessment dal backend
        setIsSydTyping(true);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${BACKEND_URL}/risk-assessment-fields`, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          // Validate response
          if (!data || !Array.isArray(data.fields)) {
            throw new Error('Invalid response format: fields array expected');
          }

          // Filtra i campi per escludere quelli readonly (campo X - descrizione_controllo)
          const fieldsToAsk = (data.fields || []).filter((field: any) => field.type !== 'readonly');
          setRiskAssessmentFields(fieldsToAsk);
          
          // Usa i dati VERI dal backend
          const firstField = fieldsToAsk[0];

          // Popola currentStepDetails con i dati REALI del backend per Syd Agent
          setCurrentStepDetails({
            stepId: 'assessment_q1',
            questionNumber: 1,
            totalQuestions: fieldsToAsk.length,
            questionText: firstField.question,
            fieldName: firstField.field_name,
            options: firstField.options.map((opt: any) => {
              if (typeof opt === 'object') {
                return {
                  value: opt.value || opt.toString(),
                  label: opt.label || opt.text || opt.toString(),
                  description: opt.description || ''
                };
              }
              return { value: opt, label: opt, description: '' };
            }),
            eventCode: riskAssessmentData?.eventCode,
            categoryName: riskSelectedCategory
          });

          addMessage({
            id: `assessment-q1-${Date.now()}`,
            text: '',
            type: 'assessment-question',
            sender: 'agent',
            timestamp: new Date().toISOString(),
            assessmentQuestionData: {
              questionNumber: 1,
              totalQuestions: fieldsToAsk.length,
              question: firstField.question,
              options: firstField.options.map((opt: any) =>
                typeof opt === 'object' ? opt.label || opt.text || opt.toString() : opt
              ),
              fieldName: firstField.field_name
            }
          });

          pushRiskHistory('assessment_q1', riskAssessmentData || {});
          setRiskFlowState('assessment_q1');
        } catch (error: any) {
          console.error('Errore caricamento campi assessment:', error);

          let errorMessage = '❌ Impossibile caricare le domande di assessment. ';

          if (error.name === 'AbortError') {
            errorMessage += 'Timeout della richiesta.';
          } else if (!navigator.onLine) {
            errorMessage += 'Connessione internet assente.';
          } else if (error.message?.includes('API returned')) {
            errorMessage += error.message;
          } else {
            errorMessage += 'Riprova più tardi.';
          }

          addMessage({
            id: `risk-error-${Date.now()}`,
            text: errorMessage,
            sender: 'agent',
            timestamp: new Date().toISOString()
          });

          // Unlock the process on error
          chatStore.setState(state => {
            if (state.setRiskProcessLocked) {
              state.setRiskProcessLocked(false);
            }
            return state;
          });
        }
        setIsSydTyping(false);
        return;
      }
    }
    
    // STEP 4-8: Gestione delle 5 domande assessment
    if (riskFlowStep.startsWith('assessment_q')) {
      const questionNumber = parseInt(riskFlowStep.replace('assessment_q', ''));
      const currentField = riskAssessmentFields[questionNumber - 1];
      
      if (currentField) {
        const answerIndex = parseInt(msg) - 1;
        
        if (answerIndex >= 0 && answerIndex < currentField.options.length) {
          // Salva la risposta
          let selectedValue = currentField.options[answerIndex];
          
          // Per campi con oggetti (perdita_economica, controllo, etc)
          if (typeof selectedValue === 'object' && selectedValue.value !== undefined) {
            selectedValue = selectedValue.value;
          }
          
          setRiskAssessmentData({ [currentField.id]: selectedValue });
          
          // CASO SPECIALE: Se abbiamo appena risposto alla domanda "controllo" (W), 
          // mostra automaticamente la descrizione del controllo (X)
          if (currentField.id === 'controllo') {
            // Genera automaticamente la descrizione del controllo
            const descrizioneControllo = updateDescrizioneControllo(selectedValue);
            
            // Salva anche la descrizione del controllo
            setRiskAssessmentData({ 
              descrizione_controllo: descrizioneControllo 
            });
            
            // Mostra la descrizione del controllo con la card dedicata
            addMessage({
              id: `control-description-${Date.now()}`,
              text: 'Descrizione del controllo',
              type: 'control-description',
              controlDescriptionData: {
                controlTitle: 'Parzialmente Adeguato',
                controlDescription: descrizioneControllo
              },
              sender: 'agent',
              timestamp: new Date().toISOString()
            });
            
            // Salta il campo X che è readonly, vai direttamente alla prossima domanda o fine
            // Il campo X viene dal backend ma non è una domanda, quindi lo saltiamo
          }
          
          // Prossima domanda o fine
          if (questionNumber < riskAssessmentFields.length) {
            const nextField = riskAssessmentFields[questionNumber];

            // Aggiorna i dettagli dello step corrente con dati REALI del backend
            setCurrentStepDetails({
              stepId: `assessment_q${questionNumber + 1}`,
              questionNumber: questionNumber + 1,
              totalQuestions: riskAssessmentFields.length,
              questionText: nextField.question,
              fieldName: nextField.field_name,
              options: nextField.options.map((opt: any) => {
                if (typeof opt === 'object') {
                  return {
                    value: opt.value || opt.toString(),
                    label: opt.label || opt.text || opt.toString(),
                    description: opt.description || ''
                  };
                }
                return { value: opt, label: opt, description: '' };
              }),
              eventCode: riskAssessmentData?.eventCode,
              categoryName: riskSelectedCategory
            });

            // Invia la prossima domanda come card
            addMessage({
              id: `assessment-q${questionNumber + 1}-${Date.now()}`,
              text: '',
              type: 'assessment-question',
              sender: 'agent',
              timestamp: new Date().toISOString(),
              assessmentQuestionData: {
                questionNumber: questionNumber + 1,
                totalQuestions: riskAssessmentFields.length,
                question: nextField.question,
                options: nextField.options.map((opt: any) => {
                  if (typeof opt === 'object') {
                    if (opt.emoji && opt.label) {
                      return `${opt.emoji} ${opt.label}`;
                    }
                    return opt.label || opt.text || opt.toString();
                  }
                  return opt;
                }),
                fieldName: nextField.field_name
              }
            });

            pushRiskHistory(`assessment_q${questionNumber + 1}` as any, { ...riskAssessmentData, [currentField.id]: selectedValue });
            setRiskFlowState(`assessment_q${questionNumber + 1}` as any);
          } else {
            // Tutte le 5 domande completate - salva e mostra risultato
            setIsSydTyping(true);
            try {
        
              // 🔴 CRITICAL: Log dei dati che verranno inviati per il report
              console.log('📊 GENERAZIONE REPORT - VERIFICA DATI:', {
                currentCategory: riskSelectedCategory,
                currentEventCode: selectedEventCode || chatStore.getState().selectedEventCode,
                allAssessmentData: riskAssessmentData,
                lastAnswer: { [currentField.id]: selectedValue }
              });

              const assessmentData = {
                ...riskAssessmentData,
                [currentField.id]: selectedValue,
                descrizione_controllo: riskAssessmentData.descrizione_controllo // Include control description
              };

              console.log('📤 DATI INVIATI AL BACKEND PER REPORT:', assessmentData);

              // POST with timeout and retry logic
              let retries = 3;
              let lastError: any = null;
              let result: any = null;

              while (retries > 0) {
                try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for POST

                  const response = await fetch(`${BACKEND_URL}/save-risk-assessment`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assessmentData),
                    signal: controller.signal
                  });

                  clearTimeout(timeoutId);

                  if (!response.ok) {
                    throw new Error(`API returned ${response.status}: ${response.statusText}`);
                  }

                  result = await response.json();

                  // Validate response
                  if (!result || typeof result !== 'object') {
                    throw new Error('Invalid response format from save API');
                  }

                  // Success - break out of retry loop
                  lastError = null;
                  break;

                } catch (error) {
                  lastError = error;
                  retries--;
                  if (retries > 0) {
                    console.log(`Retry ${3 - retries}/3 for save assessment...`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                  }
                }
              }

              // If all retries failed, throw the error
              if (lastError) {
                throw lastError;
              }

              // Determina il livello di rischio
              let riskLevel = 'Basso';
              if (result.risk_score >= 75) riskLevel = 'Critico';
              else if (result.risk_score >= 50) riskLevel = 'Alto';
              else if (result.risk_score >= 25) riskLevel = 'Medio';

              // Usa la nuova card per mostrare i risultati (senza la descrizione del controllo che è già stata mostrata)
              addMessage({
                id: `assessment-complete-${Date.now()}`,
                text: 'Valutazione completata',
                type: 'assessment-complete',
                assessmentCompleteData: {
                  riskScore: result.risk_score,
                  riskLevel,
                  analysis: result.analysis
                },
                sender: 'agent',
                timestamp: new Date().toISOString()
              });

              setRiskFlowState('completed');

              // 🔴 TALIBAN MODE: IL LOCK RIMANE FOREVER DOPO IL REPORT!
              console.log('🔒 TALIBAN: Report generato - SISTEMA LOCKED PERMANENTEMENTE');
              console.log('⛔ Nessuna modifica possibile dopo il report');
              console.log('📥 L\'utente può solo scaricare il report o pulire la chat');
              // NON SBLOCCARE MAI: chatStore.getState().setRiskProcessLocked(false);
              // Il lock rimane attivo tramite store per bloccare tutto

            } catch (error) {
              console.error('Errore salvataggio assessment:', error);
              // 🔴 TALIBAN: Anche in caso di errore, mantieni il lock
              console.log('❌ Errore nel report ma sistema rimane LOCKED');
              // NON SBLOCCARE: chatStore.getState().setRiskProcessLocked(false);
            }
            setIsSydTyping(false);
          }
        } else {
          addMessage({
            id: `invalid-answer-${Date.now()}`,
            text: `⚠️ Per favore digita un numero valido da 1 a ${currentField.options.length}`,
            sender: 'agent',
            timestamp: new Date().toISOString()
          });
        }
      }
      return;
    }
    
    // STEP 9: Dopo la valutazione completa - TALIBAN MODE
    if (riskFlowStep === 'completed') {
      // 🔴 TALIBAN: NESSUNA AZIONE POSSIBILE DOPO IL REPORT
      console.log('🚫 TALIBAN MODE: Report completato - nessuna modifica possibile');
      addMessage({
        id: `taliban-block-${Date.now()}`,
        text: '🔒 **ASSESSMENT COMPLETATO E BLOCCATO**\n\n⛔ Il report è stato generato e non può essere modificato.\n📥 Puoi scaricare il report o pulire la chat per iniziare un nuovo assessment.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      return; // STOP TOTALE

      // TUTTO IL CODICE SOTTO È DISABILITATO
      /*
      if (msg.toLowerCase().includes('report') || msg.toLowerCase().includes('genera report')) {
        // Trigger per mostrare il report
        return 'SHOW_REPORT';
      } else if (msg.includes('altro')) {
        // Rimostra la lista eventi
        let listMsg = `📋 **Eventi disponibili per questa categoria:**\n\n`;
        riskAvailableEvents.forEach((event, i) => {
          // Gestisce sia stringhe che oggetti
          const eventText = typeof event === 'string' ? event : `${event.code} - ${event.name}`;
          listMsg += `**${i+1}.** ${eventText}\n`;
        });
        listMsg += `\n💬 Quale numero?`;
        
        addMessage({
          id: `risk-again-${Date.now()}`,
          text: listMsg,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        
        setRiskFlowState('waiting_event', riskSelectedCategory, riskAvailableEvents);
      } else if (msg.includes('cambia')) {
        await startRiskFlow();
      } else if (msg.includes('fine')) {
        addMessage({
          id: `risk-bye-${Date.now()}`,
          text: '👋 Grazie per aver usato il Risk Management!',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        setRiskFlowState('idle');
      } else {
        addMessage({
          id: `risk-help-${Date.now()}`,
          text: '❓ Comandi disponibili:\n• **"report"** → Visualizza il report\n• **"altro"** → Altro evento\n• **"cambia"** → Cambia categoria\n• **"fine"** → Esci',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
      }
      */
    }
  }, [riskFlowStep, riskAvailableEvents, riskSelectedCategory, startRiskFlow, processCategory, showEventDescription, addMessage, setRiskFlowState,
      pendingEventCode, selectedEventCode, setPendingEventCode, removeEventDescriptionMessages]);

  // RESET COMPLETO del Risk Flow
  const resetRiskFlow = useCallback(() => {
    console.log('🔄 RESET RISK FLOW');
    setRiskFlowState('idle');
    setRiskAssessmentData({});
    setRiskAssessmentFields([]);
    setCurrentStepDetails(null);
    clearRiskHistory(); // NUOVO: Pulisce history al reset

    // 🎯 PULIZIA EVENTI MULTIPLI: Reset stato selezione
    clearEventSelection();
    console.log('🧹 EVENTI MULTIPLI: Selezione pulita');

    // LOCKDOWN: Unlock UI when reset
    chatStore.getState().setRiskProcessLocked(false);
    console.log('🔓 LOCKDOWN: UI unlocked via store');
  }, [setRiskFlowState, setRiskAssessmentData, setRiskAssessmentFields, setCurrentStepDetails, clearRiskHistory, clearEventSelection]);

  // NUOVO: Torna indietro di uno step - VERSIONE ANTIFRAGILE
  const goBackOneStep = useCallback(() => {
    console.log('🔙 ANTIFRAGILE BACK - Starting safe navigation');

    const state = chatStore.getState();

    // ✅ NUOVO: Solo report finale è bloccato, assessment sempre modificabile
    const currentStep = state.riskFlowStep;
    if (currentStep === 'assessment_complete' || currentStep === 'completed') {
      console.error('🚫 LOCKDOWN: Report già generato - NESSUNA MODIFICA POSSIBILE');
      console.error('⛔ Per modificare, resetta e ricomincia assessment');
      return false; // STOP SOLO SE REPORT GENERATO
    }
    // ✅ Q1-Q8: BACK sempre consentito

    // VALIDAZIONE: Verifica che possiamo andare indietro
    if (!state.canGoBack()) {
      console.warn('⚠️ ANTIFRAGILE: Cannot go back - no history');
      return false;
    }

    // VALIDAZIONE: Verifica stato corrente
    if (!currentStep.startsWith('assessment_q')) {
      console.warn('⚠️ ANTIFRAGILE: Cannot go back - not in assessment');
      return false;
    }

    // ESTRAI numero domanda corrente
    const currentQ = parseInt(currentStep.replace('assessment_q', ''));
    if (currentQ <= 1) {
      console.warn('⚠️ ANTIFRAGILE: Already at first question');
      return false;
    }

    // VALIDAZIONE TRANSIZIONI: Verifica che la transizione sia valida
    const targetStep = `assessment_q${currentQ - 1}`;
    if (!isValidTransition(currentStep, targetStep)) {
      console.warn('⚠️ ANTIFRAGILE: Invalid transition', currentStep, '->', targetStep);
      return false;
    }

    console.log('✅ ANTIFRAGILE: Navigation validated', currentStep, '->', targetStep);

    // ATOMIC STATE UPDATE: Modifica messaggi e step in una singola operazione atomica
    chatStore.setState(currentState => {
      const newMessages = [...currentState.messages];

      // Trova l'ultimo messaggio di tipo assessment-question
      let lastQuestionIndex = -1;
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].type === 'assessment-question') {
          lastQuestionIndex = i;
          break;
        }
      }

      if (lastQuestionIndex >= 0) {
        // Rimuovi la domanda corrente e la risposta dell'utente (se presente)
        const messagesToRemove = newMessages[lastQuestionIndex + 1] &&
                                newMessages[lastQuestionIndex + 1].sender === 'user' ? 2 : 1;
        newMessages.splice(lastQuestionIndex, messagesToRemove);

        console.log('🗑️ ANTIFRAGILE: Removed', messagesToRemove, 'messages');
      }

      return {
        ...currentState,
        messages: newMessages,
        riskFlowStep: targetStep as any
      };
    });

    // AGGIORNA history stack
    state.popRiskHistory();

    console.log('✅ ANTIFRAGILE BACK COMPLETED - Now at step:', targetStep);
    return true;
  }, []);

  // UNIVERSALE: Vai indietro da QUALSIASI step (eventi, descrizione, domande)
  const goBackUniversal = useCallback(() => {
    console.log('⬅️ UNIVERSAL BACK');

    const state = chatStore.getState();
    const currentStep = state.riskFlowStep;

    console.log('Current step:', currentStep);

    // Check lock
    if (currentStep === 'assessment_complete' || currentStep === 'completed') {
      console.error('🚫 Report già generato - no back');
      return false;
    }

    // CASO 1: Da waiting_event → waiting_category
    if (currentStep === 'waiting_event') {
      console.log('📂 Back: Eventi → Categorie');

      // Rimuovi messaggio eventi
      chatStore.setState(s => ({
        messages: s.messages.filter(m => m.type !== 'risk-events')
      }));

      // Torna a categorie
      chatStore.setState({ riskFlowStep: 'waiting_category' as any });
      state.pushRiskHistory('waiting_category', {});

      return true;
    }

    // CASO 2: Da waiting_choice (descrizione) → waiting_event
    if (currentStep === 'waiting_choice') {
      console.log('📋 Back: Descrizione → Eventi');

      // Rimuovi messaggio descrizione
      chatStore.setState(s => ({
        messages: s.messages.filter(m => m.type !== 'risk-description')
      }));

      // Torna a eventi
      chatStore.setState({ riskFlowStep: 'waiting_event' as any });
      state.pushRiskHistory('waiting_event', { category: state.riskSelectedCategory });

      return true;
    }

    // CASO 3: Da assessment_q1 → waiting_choice (descrizione)
    if (currentStep === 'assessment_q1') {
      console.log('❓ Back: Q1 → Descrizione');

      // Rimuovi messaggio Q1
      chatStore.setState(s => ({
        messages: s.messages.filter(m => m.type !== 'assessment-question')
      }));

      // Torna a descrizione
      chatStore.setState({ riskFlowStep: 'waiting_choice' as any });
      state.pushRiskHistory('waiting_choice', state.riskAssessmentData || {});

      return true;
    }

    // CASO 4: Da assessment_q2-q8 → usa goBackOneStep esistente
    if (currentStep.startsWith('assessment_q')) {
      return goBackOneStep();
    }

    console.warn('⚠️ Non posso andare indietro da:', currentStep);
    return false;
  }, [goBackOneStep]);

  // NUOVO: Vai avanti di uno step - VERSIONE SEMPLICE (senza troppe validazioni)
  const goForwardOneStep = useCallback(() => {
    console.log('🚀🚀🚀 FORWARD CALLED');

    const state = chatStore.getState();
    const currentStep = state.riskFlowStep;
    console.log('Current step:', currentStep);

    // VALIDAZIONE: Solo se siamo in assessment
    if (!currentStep.startsWith('assessment_q')) {
      console.warn('Cannot go forward - not in assessment');
      return false;
    }

    // Estrai numero domanda corrente
    const currentQ = parseInt(currentStep.replace('assessment_q', ''));
    const totalQuestions = state.riskAssessmentFields.length;

    // Prossima domanda = currentQ + 1
    const nextQ = currentQ + 1;

    console.log(`Going from Q${currentQ} to Q${nextQ} (total: ${totalQuestions})`);

    // Se ultima domanda, vai a complete
    if (nextQ > totalQuestions) {
      console.log('Last question completed - going to assessment_complete');
      chatStore.setState({ riskFlowStep: 'assessment_complete' as any });
      return true;
    }

    // Vai alla prossima domanda
    const targetStep = `assessment_q${nextQ}`;
    console.log(`Changing step to: ${targetStep}`);

    chatStore.setState({ riskFlowStep: targetStep as any });
    state.pushRiskHistory(targetStep as any, state.riskAssessmentData || {});

    console.log('✅ Forward completed');
    return true;
  }, []);

  // ANTIFRAGILE: Funzione di validazione stato sistema
  const validateSystemState = useCallback(() => {
    const state = chatStore.getState();
    const issues = [];

    // Check 1: Coerenza step e history
    if (state.riskFlowStep.startsWith('assessment_q') && state.riskFlowHistory.length === 0) {
      issues.push('History vuoto durante assessment');
    }

    // Check 2: Lock state consistency
    if (state.isProcessLocked() && !state.riskFlowStep.startsWith('assessment_q')) {
      issues.push('Processo locked ma non in assessment');
    }

    // Check 3: Lock consistency
    if (state.isProcessLocked() && state.riskFlowStep === 'idle') {
      issues.push('Processo locked ma step idle');
    }

    // Check 4: Assessment data consistency
    if (state.riskFlowStep.startsWith('assessment_q') && !state.riskAssessmentData) {
      issues.push('Assessment step ma data mancanti');
    }

    if (issues.length > 0) {
      console.warn('🚨 ANTIFRAGILE: System state issues detected:', issues);
      return { valid: false, issues };
    }

    console.log('✅ ANTIFRAGILE: System state validated successfully');
    return { valid: true, issues: [] };
  }, [riskFlowStep]);

  // SISTEMA CLEAN RESTART ATOMICO - Per cambio categoria/evento durante assessment
  const cleanRestartAssessment = useCallback(async (newEventCode?: string) => {
    console.log('🔄 CAMBIO CATEGORIA/EVENTO durante assessment');
    console.log('🚨 CRITICAL: Pulizia COMPLETA memoria per evitare report errati');

    // Controlla da dove viene il cambio
    const currentState = chatStore.getState();
    const currentStep = currentState.riskFlowStep;
    const isInQuestions = currentStep.startsWith('assessment_q');

    console.log(`📍 Cambio da: ${currentStep} (Domande 1-6: ${isInQuestions})`);

    // 1. IL LOCK RIMANE SEMPRE ATTIVO!
    console.log('🔒 LOCK MANTENUTO - Processo assessment ancora attivo');

    // 2. Clear messaggi assessment ma mantieni categorie/eventi (ATOMIC)
    chatStore.setState(state => {
      const cleanMessages = state.messages.filter(msg =>
        msg.type === 'risk-categories' ||
        msg.type === 'risk-events' ||
        msg.type === 'risk-description' // Mantieni anche descrizione evento
      );
      console.log('🧹 Messaggi domande puliti, categorie/eventi mantenuti');
      return {
        ...state,
        messages: cleanMessages
      };
    });

    // 3. Reset completo dati assessment per ricominciare
    console.log('🗑️ PULIZIA TOTALE: Azzeramento dati assessment precedenti');
    setRiskAssessmentData({});
    setRiskAssessmentFields([]);
    clearEventSelection();

    // 🔴 CRITICO: PULIRE ANCHE LA HISTORY CHE CONTIENE I VECCHI DATI!
    clearRiskHistory();
    console.log('💀 HISTORY PULITA: Nessun dato vecchio può rimanere in memoria');

    // Log per verificare che tutto sia pulito
    const stateAfterClear = chatStore.getState();
    console.log('🔍 VERIFICA PULIZIA:', {
      assessmentData: stateAfterClear.riskAssessmentData,
      assessmentFields: stateAfterClear.riskAssessmentFields,
      historyLength: stateAfterClear.riskFlowHistory?.length || 0,
      selectedEvent: stateAfterClear.selectedEventCode
    });

    // 4. Torna a waiting_event per scegliere nuovo evento
    setRiskFlowState('waiting_event');
    console.log('↩️ Tornato a selezione evento');

    // 5. Se nuovo evento passato direttamente, caricalo
    if (newEventCode) {
      // Forza reload per bypassare controlli
      await showEventDescription(newEventCode, true);
      console.log('🎯 Nuovo evento caricato:', newEventCode);
    }

    console.log('✅ Cambio completato - MEMORIA PULITA - Report sarà accurato');
  }, [setRiskFlowState, setRiskAssessmentData, setRiskAssessmentFields,
      setCurrentStepDetails, clearRiskHistory, clearEventSelection, showEventDescription]);

  return {
    startRiskFlow,
    handleUserMessage,
    showEventDescription, // Esposta per RiskEventCards
    resetRiskFlow,
    goBackOneStep, // NUOVO: Esponi funzione back antifragile
    goBackUniversal, // UNIVERSALE: Back da qualsiasi step
    goForwardOneStep, // NUOVO: Esponi funzione forward antifragile
    canGoBack,     // NUOVO: Esponi check se può tornare indietro
    cleanRestartAssessment, // NUOVO: Sistema restart atomico
    currentStep: riskFlowStep,
    isValidTransition, // NUOVO: Esponi validazione transizioni
    validateSystemState // NUOVO: Esponi validazione sistema
  };
};