import { useCallback, useState } from 'react';
import { useChatStore } from '../store';
import { useAppStore } from '../store/useStore';
import { chatStore } from '../store/chatStore';

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

// WARFARE: Process isolation - solo un processo Risk alla volta
let ACTIVE_RISK_PROCESS: string | null = null;
const PROCESS_TIMEOUT = 30000; // 30 secondi max per processo

// WARFARE: State validation
const VALID_TRANSITIONS: Record<string, string[]> = {
  'idle': ['waiting_category'],
  'waiting_category': ['waiting_event', 'idle'],
  'waiting_event': ['waiting_choice', 'waiting_category', 'idle'],
  'waiting_choice': ['assessment_q1', 'waiting_event', 'idle'],
  'assessment_q1': ['assessment_q2', 'idle'],
  'assessment_q2': ['assessment_q3', 'assessment_q1', 'idle'],
  'assessment_q3': ['assessment_q4', 'assessment_q2', 'idle'],
  'assessment_q4': ['assessment_q5', 'assessment_q3', 'idle'],
  'assessment_q5': ['assessment_q6', 'assessment_q4', 'idle'],
  'assessment_q6': ['assessment_q7', 'assessment_q5', 'idle'],
  'assessment_q7': ['assessment_q8', 'assessment_q6', 'idle'],
  'assessment_q8': ['assessment_complete', 'assessment_q7', 'idle'],
  'assessment_complete': ['completed', 'idle'],
  'completed': ['waiting_event', 'waiting_category', 'idle']
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
    riskFlowHistory
  } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  // STEP 1: Mostra le 7 categorie
  const startRiskFlow = useCallback(async () => {
    console.log('🚀 START RISK FLOW - Called at:', new Date().toISOString());
    console.log('Current step before:', riskFlowStep);

    // WARFARE: Process isolation enforcement
    const processId = `risk-${Date.now()}-${Math.random()}`;

    if (ACTIVE_RISK_PROCESS) {
      console.warn('⚠️ WARFARE: Another Risk process active, force killing');
      ACTIVE_RISK_PROCESS = null;
      // Nuclear cleanup
      clearRiskHistory();
      setRiskFlowState('idle');
      setRiskAssessmentData({});
      setRiskAssessmentFields([]);
    }

    // Claim this process
    ACTIVE_RISK_PROCESS = processId;
    console.log('🛡️ WARFARE: Process claimed:', processId);

    // Reset any previous state to ensure clean start
    if (riskFlowStep !== 'idle') {
      console.log('⚠️ Risk flow already in progress, resetting...');
      clearRiskHistory(); // IMPORTANTE: Pulisci history prima del reset
      setRiskFlowState('idle');
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Timeout cleanup
    setTimeout(() => {
      if (ACTIVE_RISK_PROCESS === processId) {
        console.warn('⏰ WARFARE: Process timeout');
        ACTIVE_RISK_PROCESS = null;
        setRiskFlowState('idle');
      }
    }, PROCESS_TIMEOUT);

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
    
    setIsSydTyping(true);
    
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
      const backendUrl = 'https://web-production-3373.up.railway.app';
      console.log('🔍 Calling Risk API:', `${backendUrl}/events/${categoryKey}`);
      const response = await fetch(`${backendUrl}/events/${categoryKey}`);

      if (!response.ok) {
        console.error('❌ Risk API error:', response.status, response.statusText);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Risk API response:', data);
      
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
      
    } catch (error) {
      console.error('Errore:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel caricamento eventi. Verifica che il backend sia attivo.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    }
    
    setIsSydTyping(false);
  }, [addMessage, setIsSydTyping, setRiskFlowState]);

  // STEP 3: Mostra descrizione dell'evento scelto (VLOOKUP di Excel!)
  const showEventDescription = useCallback(async (eventCode: string) => {
    console.log('📋 RECUPERO DESCRIZIONE PER:', eventCode);
    setIsSydTyping(true);
    
    try {
      // CHIAMA BACKEND PER LA DESCRIZIONE
      const backendUrl = 'https://web-production-3373.up.railway.app';
      const response = await fetch(`${backendUrl}/description/${encodeURIComponent(eventCode)}`);
      const data = await response.json();
      
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

      // Aggiorna currentStepDetails per Syd Agent
      setCurrentStepDetails({
        stepId: 'waiting_choice',
        eventCode: eventCode,
        categoryName: riskSelectedCategory,
        questionText: `Vuoi procedere con la valutazione del rischio per l'evento ${eventCode}?`
      });

      // Passa allo stato di attesa conferma per iniziare le 5 domande
      setRiskFlowState('waiting_choice', riskSelectedCategory, riskAvailableEvents);
      
    } catch (error) {
      console.error('Errore:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel caricamento della descrizione',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    }
    
    setIsSydTyping(false);
  }, [addMessage, setIsSydTyping, setRiskFlowState, riskSelectedCategory, riskAvailableEvents]);

  // GESTIONE MESSAGGI - SEMPLICE COME EXCEL!
  const handleUserMessage = useCallback(async (message: string) => {
    console.log('💬 MESSAGGIO:', message, 'STEP:', riskFlowStep);
    const msg = message.toLowerCase();
    
    // STEP 0: Se idle e dice risk
    if (riskFlowStep === 'idle' && (msg.includes('risk') || msg.includes('rischi'))) {
      await startRiskFlow();
      return;
    }
    
    // STEP 1: Aspetta categoria
    if (riskFlowStep === 'waiting_category') {
      await processCategory(message);
      return;
    }
    
    // STEP 2: Aspetta selezione evento (numero o codice)
    if (riskFlowStep === 'waiting_event') {
      let eventoSelezionato = null;
      let eventCode = null;
      
      // Se è un codice a 3 cifre (es: "101", "505", "501") - PRIMA di controllare numero singolo
      if (msg.match(/^\d{3}$/)) {
        const codice = msg;
        
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
      else if (msg.match(/^\d+$/)) {
        const index = parseInt(msg) - 1;
        if (index >= 0 && index < riskAvailableEvents.length) {
          eventoSelezionato = riskAvailableEvents[index];
          // Estrai il codice dall'evento
          if (typeof eventoSelezionato === 'string') {
            const match = eventoSelezionato.match(/\[(\d{3})\]/);
            if (match) {
              eventCode = match[1];
            }
          }
        }
      }
      // Se è testo, cerca match nel nome
      else {
        eventoSelezionato = riskAvailableEvents.find(e => {
          if (typeof e === 'string') {
            return e.toLowerCase().includes(msg);
          } else if (e && typeof e === 'object' && 'name' in e) {
            return e.name.toLowerCase().includes(msg);
          }
          return false;
        });
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
    
    // STEP 3.5: Conferma per iniziare le 5 domande assessment
    if (riskFlowStep === 'waiting_choice') {
      if (msg.toLowerCase().includes('sì') || msg.toLowerCase().includes('si')) {
        // Carica i campi assessment dal backend
        setIsSydTyping(true);
        try {
          const backendUrl = 'https://web-production-3373.up.railway.app';
          const response = await fetch(`${backendUrl}/risk-assessment-fields`);
          const data = await response.json();
          
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
        } catch (error) {
          console.error('Errore caricamento campi assessment:', error);
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
              const backendUrl = 'https://web-production-3373.up.railway.app';
              const assessmentData = {
                ...riskAssessmentData,
                [currentField.id]: selectedValue,
                descrizione_controllo: riskAssessmentData.descrizione_controllo // Include control description
              };
              
              const response = await fetch(`${backendUrl}/save-risk-assessment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData)
              });
              
              const result = await response.json();
              
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
            } catch (error) {
              console.error('Errore salvataggio assessment:', error);
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
    
    // STEP 9: Dopo la valutazione completa
    if (riskFlowStep === 'completed') {
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
    }
  }, [riskFlowStep, riskAvailableEvents, riskSelectedCategory, startRiskFlow, processCategory, showEventDescription, addMessage, setRiskFlowState]);

  // RESET COMPLETO del Risk Flow
  const resetRiskFlow = useCallback(() => {
    console.log('🔄 RESET RISK FLOW');
    setRiskFlowState('idle');
    setRiskAssessmentData({});
    setRiskAssessmentFields([]);
    setCurrentStepDetails(null);
    clearRiskHistory(); // NUOVO: Pulisce history al reset
  }, [setRiskFlowState, setRiskAssessmentData, setRiskAssessmentFields, setCurrentStepDetails, clearRiskHistory]);

  // NUOVO: Torna indietro di uno step
  const goBackOneStep = useCallback(() => {
    console.log('🚨 FUCK IT - GOING BACK BY FORCE');

    // BRUTALE: Rimuovi gli ultimi 3 messaggi dalla chat
    const currentMessages = chatStore.getState().messages;
    const newMessages = currentMessages.slice(0, -3);

    console.log('🗑️ BRUTAL: Removing last 3 messages');
    console.log('📊 Messages before:', currentMessages.length);
    console.log('📊 Messages after:', newMessages.length);

    // Set direttamente i messaggi
    chatStore.setState({ messages: newMessages });

    console.log('✅ BRUTAL BACK COMPLETED');
  }, []);

  return {
    startRiskFlow,
    handleUserMessage,
    showEventDescription,
    resetRiskFlow,
    goBackOneStep, // NUOVO: Esponi funzione back
    canGoBack,     // NUOVO: Esponi check se può tornare indietro
    currentStep: riskFlowStep
  };
};