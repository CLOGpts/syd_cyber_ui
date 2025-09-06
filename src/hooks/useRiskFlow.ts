import { useCallback } from 'react';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';

export const useRiskFlow = () => {
  const { 
    addMessage, 
    riskFlowStep, 
    riskSelectedCategory,
    riskAvailableEvents,
    riskAssessmentData,
    riskAssessmentFields,
    setRiskFlowState,
    setRiskAssessmentData,
    setRiskAssessmentFields
  } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  // STEP 1: Mostra le 7 categorie
  const startRiskFlow = useCallback(async () => {
    console.log('🚀 START RISK FLOW');
    
    setRiskFlowState('waiting_category');
    
    const welcomeMsg = `🛡️ **SISTEMA RISK MANAGEMENT ENTERPRISE**
━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **Database Professionale:**
• **191 scenari di rischio** mappati
• **7 categorie principali** di analisi
• **Formule VLOOKUP** da Excel preservate
• **100% compliance** Basel II/III

**🎯 SELEZIONA LA CATEGORIA DI RISCHIO:**

🔥 **DANNI FISICI** *(10 eventi)*
   └─ Disastri naturali, incendi, furti
   
💻 **SISTEMI & IT** *(20 eventi)*
   └─ Cyber attack, downtime, data breach
   
👥 **RISORSE UMANE** *(22 eventi)*
   └─ Controversie, infortuni, turnover
   
⚙️ **OPERATIONS** *(59 eventi)*
   └─ Errori processo, qualità, consegne
   
🤝 **CLIENTI & COMPLIANCE** *(44 eventi)*
   └─ Reclami, sanzioni, reputation
   
🔓 **FRODI INTERNE** *(20 eventi)*
   └─ Appropriazione, corruzione, insider
   
🚨 **FRODI ESTERNE** *(16 eventi)*
   └─ Falsificazione, phishing, furto identità

━━━━━━━━━━━━━━━━━━━━━━━━━
💬 **Digita la categoria** (es: "danni" o "clienti")`;

    addMessage({
      id: `risk-welcome-${Date.now()}`,
      text: welcomeMsg,
      sender: 'agent',
      timestamp: new Date().toISOString()
    });
    
  }, [addMessage, setRiskFlowState]);

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
      const backendUrl = import.meta.env.VITE_RISK_API_BASE || 'https://ateco-lookup.onrender.com';
      const response = await fetch(`${backendUrl}/events/${categoryKey}`);
      const data = await response.json();
      
      // SALVA TUTTI GLI EVENTI
      setRiskFlowState('waiting_event', categoryKey, data.events || []);
      
      // MOSTRA TUTTI GLI EVENTI CON FORMATTAZIONE PROFESSIONALE
      const totalEvents = data.events?.length || data.total || 0;
      let listMsg = `📋 **CATEGORIA: ${categoryName.toUpperCase()}**\n`;
      listMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      listMsg += `📊 **Totale rischi mappati: ${totalEvents}**\n\n`;
      
      // Raggruppa per severity se disponibile
      const critical = data.events.filter((e: any) => e.severity === 'critical').length || 0;
      const high = data.events.filter((e: any) => e.severity === 'high').length || 0;
      const medium = data.events.filter((e: any) => e.severity === 'medium').length || 0;
      const low = data.events.filter((e: any) => e.severity === 'low').length || 0;
      
      if (critical + high + medium + low > 0) {
        listMsg += `**⚠️ Distribuzione per severità:**\n`;
        if (critical > 0) listMsg += `🔴 Critico: ${critical} eventi\n`;
        if (high > 0) listMsg += `🟠 Alto: ${high} eventi\n`;
        if (medium > 0) listMsg += `🟡 Medio: ${medium} eventi\n`;
        if (low > 0) listMsg += `🟢 Basso: ${low} eventi\n`;
        listMsg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
      
      listMsg += `**📝 EVENTI DISPONIBILI:**\n\n`;
      
      data.events.forEach((event: any, i: number) => {
        const eventText = typeof event === 'string' ? event : event.name || event;
        const code = typeof event === 'object' ? event.code : '';
        const severity = typeof event === 'object' && event.severity ? 
          (event.severity === 'critical' ? '🔴' : 
           event.severity === 'high' ? '🟠' : 
           event.severity === 'medium' ? '🟡' : '🟢') : '▫️';
        
        listMsg += `${severity} **[${code || (i+1).toString().padStart(3, '0')}]** ${eventText}\n`;
      });
      
      listMsg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      listMsg += `💬 **Seleziona un evento per l'analisi dettagliata**\n`;
      listMsg += `Digita il **numero** (1-${totalEvents}) o il **codice** (es: ${data.events[0]?.code || '101'})`;
      
      addMessage({
        id: `risk-events-${Date.now()}`,
        text: listMsg,
        sender: 'agent',
        timestamp: new Date().toISOString()
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
      const backendUrl = import.meta.env.VITE_RISK_API_BASE || 'https://ateco-lookup.onrender.com';
      const response = await fetch(`${backendUrl}/description/${encodeURIComponent(eventCode)}`);
      const data = await response.json();
      
      // MOSTRA LA DESCRIZIONE PROFESSIONALE CON METRICHE
      const eventName = data.name || eventCode;
      const severity = data.severity || 'medium';
      const severityIcon = severity === 'critical' ? '🔴' : 
                          severity === 'high' ? '🟠' : 
                          severity === 'medium' ? '🟡' : '🟢';
      
      const descMsg = `📊 **ANALISI RISCHIO #${eventCode}**
━━━━━━━━━━━━━━━━━━━━━━━━━

${severityIcon} **Evento:** ${eventName}
📈 **Severità:** ${severity.toUpperCase()}
🏢 **Categoria:** ${riskSelectedCategory}

━━━━━━━━━━━━━━━━━━━━━━━━━

📄 **DESCRIZIONE DETTAGLIATA:**
${data.description || 'Descrizione completa dell\'evento di rischio secondo le best practice di risk management.'}

━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 **METRICHE DI RISCHIO:**
• **Probabilità:** ${data.probability || 'Media'}
• **Impatto:** ${data.impact || 'Significativo'}
• **Controlli richiesti:** ${data.controls || 'Standard'}
• **Monitoraggio:** ${data.monitoring || 'Trimestrale'}

━━━━━━━━━━━━━━━━━━━━━━━━━

✅ **ANALISI EVENTO COMPLETATA**

Ora procediamo con la **valutazione della Perdita Finanziaria Attesa**.
Ti farò 5 domande per valutare l'impatto di questo rischio.

**Iniziamo? Rispondi "sì" per continuare**`;

      addMessage({
        id: `risk-desc-${Date.now()}`,
        text: descMsg,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      // Salva i dati dell'evento per l'assessment
      setRiskAssessmentData({ 
        eventCode: eventCode, 
        category: riskSelectedCategory || '' 
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
      
      // Se è un numero puro (es: "5")
      if (msg.match(/^\d+$/)) {
        const index = parseInt(msg) - 1;
        if (index >= 0 && index < riskAvailableEvents.length) {
          eventoSelezionato = riskAvailableEvents[index];
        }
      }
      // Se è un codice a 3 cifre (es: "101", "505")
      else if (msg.match(/\d{3}/)) {
        const codice = msg.match(/\d{3}/)?.[0];
        // Gli eventi ora sono oggetti {code: "101", name: "..."}
        eventoSelezionato = riskAvailableEvents.find(e => {
          if (typeof e === 'string') {
            return e.startsWith(codice!);
          } else if (e && typeof e === 'object' && 'code' in e) {
            return e.code === codice;
          }
          return false;
        });
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
      
      if (eventoSelezionato) {
        // IMPORTANTE: Passa solo il CODICE, non l'oggetto completo!
        const eventCode = typeof eventoSelezionato === 'string' 
          ? eventoSelezionato 
          : eventoSelezionato.code;
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
          const backendUrl = import.meta.env.VITE_RISK_API_BASE || 'https://ateco-lookup.onrender.com';
          const response = await fetch(`${backendUrl}/risk-assessment-fields`);
          const data = await response.json();
          
          setRiskAssessmentFields(data.fields || []);
          
          // Mostra la prima domanda (impatto finanziario)
          const firstField = data.fields[0];
          let questionMsg = `💰 **DOMANDA 1 di 5**\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          questionMsg += `**${firstField.question}**\n\n`;
          questionMsg += `Seleziona una delle seguenti opzioni:\n\n`;
          
          firstField.options.forEach((opt: string, i: number) => {
            questionMsg += `**${i+1}.** ${opt}\n`;
          });
          
          questionMsg += `\n💬 Digita il numero della tua scelta (1-${firstField.options.length})`;
          
          addMessage({
            id: `assessment-q1-${Date.now()}`,
            text: questionMsg,
            sender: 'agent',
            timestamp: new Date().toISOString()
          });
          
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
          
          // Per campi con oggetti (perdita_economica)
          if (typeof selectedValue === 'object' && selectedValue.value) {
            selectedValue = selectedValue.value;
          }
          
          setRiskAssessmentData({ [currentField.id]: selectedValue });
          
          // Prossima domanda o fine
          if (questionNumber < 5) {
            const nextField = riskAssessmentFields[questionNumber];
            let nextMsg = '';
            
            // Icone diverse per ogni domanda
            const icons = ['💰', '📊', '🏢', '⚖️', '🚔'];
            const icon = icons[questionNumber] || '❓';
            
            nextMsg += `${icon} **DOMANDA ${questionNumber + 1} di 5**\n`;
            nextMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            nextMsg += `**${nextField.question}**\n`;
            
            if (nextField.description) {
              nextMsg += `_${nextField.description}_\n`;
            }
            nextMsg += `\n`;
            
            // Formattazione speciale per campi colorati
            if (nextField.type === 'select_color') {
              nextField.options.forEach((opt: any, i: number) => {
                nextMsg += `${opt.emoji} **${i+1}.** ${opt.label}\n`;
              });
            } else {
              nextField.options.forEach((opt: string, i: number) => {
                nextMsg += `**${i+1}.** ${opt}\n`;
              });
            }
            
            nextMsg += `\n💬 Digita il numero della tua scelta (1-${nextField.options.length})`;
            
            addMessage({
              id: `assessment-q${questionNumber + 1}-${Date.now()}`,
              text: nextMsg,
              sender: 'agent',
              timestamp: new Date().toISOString()
            });
            
            setRiskFlowState(`assessment_q${questionNumber + 1}` as any);
          } else {
            // Tutte le 5 domande completate - salva e mostra risultato
            setIsSydTyping(true);
            try {
              const backendUrl = import.meta.env.VITE_RISK_API_BASE || 'https://ateco-lookup.onrender.com';
              const assessmentData = {
                ...riskAssessmentData,
                [currentField.id]: selectedValue
              };
              
              const response = await fetch(`${backendUrl}/save-risk-assessment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData)
              });
              
              const result = await response.json();
              
              let finalMsg = `✅ **VALUTAZIONE COMPLETATA**\n`;
              finalMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
              finalMsg += `📊 **Risk Score: ${result.risk_score}/100**\n`;
              finalMsg += `📈 **${result.analysis}**\n\n`;
              finalMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
              finalMsg += `**Cosa vuoi fare ora?**\n`;
              finalMsg += `• **"altro"** → Valuta un altro evento\n`;
              finalMsg += `• **"cambia"** → Cambia categoria\n`;
              finalMsg += `• **"fine"** → Termina sessione`;
              
              addMessage({
                id: `assessment-complete-${Date.now()}`,
                text: finalMsg,
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
      if (msg.includes('altro')) {
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
          text: '❓ Scrivi: "altro", "cambia" o "fine"',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [riskFlowStep, riskAvailableEvents, riskSelectedCategory, startRiskFlow, processCategory, showEventDescription, addMessage, setRiskFlowState]);

  return {
    startRiskFlow,
    handleUserMessage,
    currentStep: riskFlowStep
  };
};