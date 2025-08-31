import { useCallback } from 'react';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';

export const useRiskFlow = () => {
  const { 
    addMessage, 
    riskFlowStep, 
    riskSelectedCategory,
    riskAvailableEvents,
    setRiskFlowState 
  } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  // STEP 1: Mostra le 7 categorie
  const startRiskFlow = useCallback(async () => {
    console.log('🚀 START RISK FLOW');
    
    setRiskFlowState('waiting_category');
    
    const welcomeMsg = `🛡️ **Benvenuto nel Risk Management**

Ho accesso a **7 categorie** di rischio con **191 scenari** mappati da consulenti esperti.

**Di quale categoria di rischio vuoi parlare?**

• 🔥 **Danni** - Danni fisici e disastri
• 💻 **Sistemi** - Problemi informatici  
• 👥 **Dipendenti** - Questioni con i dipendenti
• ⚙️ **Produzione** - Errori di produzione/consegna
• 🤝 **Clienti** - Problemi con i clienti
• 🔓 **Frodi interne** - Frodi dall\'azienda
• 🚨 **Frodi esterne** - Frodi dall\'esterno

💬 Scrivi la categoria (es: "clienti")`;

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
    
    // Mappa input -> chiave backend
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
      const response = await fetch(`http://localhost:8000/events/${categoryKey}`);
      const data = await response.json();
      
      // SALVA TUTTI GLI EVENTI
      setRiskFlowState('waiting_event', categoryKey, data.events || []);
      
      // MOSTRA TUTTI GLI EVENTI (COME FA EXCEL!)
      let listMsg = `✅ **Per la categoria ${categoryName}, ecco TUTTI i ${data.total} rischi disponibili:**\n\n`;
      
      data.events.forEach((event: string, i: number) => {
        // Mostra TUTTO l'evento completo
        listMsg += `**${i+1}.** ${event}\n`;
      });
      
      listMsg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      listMsg += `💬 **Quale evento vuoi approfondire?**\nScrivi il numero (es: "5") o il codice (es: "505")`;
      
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
      const response = await fetch(`http://localhost:8000/description/${encodeURIComponent(eventCode)}`);
      const data = await response.json();
      
      // MOSTRA LA DESCRIZIONE (COME EXCEL!)
      const descMsg = `📋 **${eventCode}**
━━━━━━━━━━━━━━━━━━━━━━━━━

📄 **DESCRIZIONE COMPLETA:**
${data.description}

━━━━━━━━━━━━━━━━━━━━━━━━━

✅ **Analisi completata!**

**Cosa vuoi fare ora?**
• Scrivi **"altro"** per vedere un altro evento di questa categoria
• Scrivi **"cambia"** per cambiare categoria  
• Scrivi **"fine"** per terminare`;

      addMessage({
        id: `risk-desc-${Date.now()}`,
        text: descMsg,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      setRiskFlowState('completed', riskSelectedCategory, riskAvailableEvents);
      
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
      // Se è un codice a 3 cifre (es: "505")
      else if (msg.match(/\d{3}/)) {
        const codice = msg.match(/\d{3}/)?.[0];
        eventoSelezionato = riskAvailableEvents.find(e => e.startsWith(codice!));
      }
      // Se è testo, cerca match
      else {
        eventoSelezionato = riskAvailableEvents.find(e => 
          e.toLowerCase().includes(msg)
        );
      }
      
      if (eventoSelezionato) {
        await showEventDescription(eventoSelezionato);
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
    
    // STEP 3: Dopo la descrizione
    if (riskFlowStep === 'completed') {
      if (msg.includes('altro')) {
        // Rimostra la lista eventi
        let listMsg = `📋 **Eventi disponibili per questa categoria:**\n\n`;
        riskAvailableEvents.forEach((event, i) => {
          listMsg += `**${i+1}.** ${event}\n`;
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