import { useState, useCallback } from 'react';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';

// Mappa semplice per le categorie
const CATEGORY_MAP: Record<string, string> = {
  'Damage_Danni': '🔥 Danni fisici e disastri',
  'Business_disruption': '💻 Problemi con i sistemi informatici',
  'Employment_practices_Dipendenti': '👥 Questioni con i dipendenti',
  'Execution_delivery_Problemi_di_produzione_o_consegna': '⚙️ Errori di produzione o consegna',
  'Clients_product_Clienti': '🤝 Problemi con i clienti',
  'Internal_Fraud_Frodi_interne': '🔓 Frodi interne all\'azienda',
  'External_fraud_Frodi_esterne': '🚨 Frodi dall\'esterno'
};

export const useSimpleRiskManagement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'category' | 'event' | 'description'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { addMessage } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  // STEP 1: Inizia il Risk Management
  const startRiskManagement = useCallback(async () => {
    console.log('🚀 START RISK MANAGEMENT CHIAMATO!');
    setIsProcessing(true);
    setIsSydTyping(true);
    setCurrentStep('category');
    
    try {
      // Chiama il backend per le categorie
      const response = await fetch('http://localhost:8000/categories');
      const data = await response.json();
      console.log('📋 Categorie ricevute:', data);
      
      // Messaggio conversazionale dell'AI
      const aiMessage = `Ciao! Sono qui per aiutarti con l'analisi dei rischi operativi della tua azienda. 

Ho accesso a **${data.total} categorie** di rischio con oltre **191 scenari** mappati da consulenti esperti.

**Di quale tipo di rischio vuoi parlare?**

${data.categories.map((cat: string) => `• ${CATEGORY_MAP[cat] || cat}`).join('\n')}

💡 *Puoi anche dirmi direttamente il tuo problema (es. "privacy", "terremoto", "furto") e ti guiderò io!*`;

      addMessage({
        id: `risk-intro-${Date.now()}`,
        text: aiMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Errore nel caricamento categorie:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Mi dispiace, non riesco a caricare le categorie di rischio. Verifica che il server backend sia attivo.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping]);

  // STEP 2: Gestisci la selezione della categoria
  const handleCategorySelection = useCallback(async (userInput: string) => {
    setIsProcessing(true);
    setIsSydTyping(true);
    
    // Trova la categoria giusta dall'input dell'utente
    let categoryKey: string | null = null;
    const inputLower = userInput.toLowerCase();
    
    // Cerca per parole chiave
    if (inputLower.includes('client') || inputLower.includes('privacy')) {
      categoryKey = 'Clients_product_Clienti';
    } else if (inputLower.includes('dann') || inputLower.includes('disastr') || inputLower.includes('incend')) {
      categoryKey = 'Damage_Danni';
    } else if (inputLower.includes('sistem') || inputLower.includes('informat') || inputLower.includes('computer')) {
      categoryKey = 'Business_disruption';
    } else if (inputLower.includes('dipendent') || inputLower.includes('personal')) {
      categoryKey = 'Employment_practices_Dipendenti';
    } else if (inputLower.includes('produzion') || inputLower.includes('consegn')) {
      categoryKey = 'Execution_delivery_Problemi_di_produzione_o_consegna';
    } else if (inputLower.includes('frodi intern') || inputLower.includes('furto intern')) {
      categoryKey = 'Internal_Fraud_Frodi_interne';
    } else if (inputLower.includes('frodi estern') || inputLower.includes('hacker')) {
      categoryKey = 'External_fraud_Frodi_esterne';
    }
    
    if (!categoryKey) {
      addMessage({
        id: `risk-notfound-${Date.now()}`,
        text: `🤔 Non ho capito bene. Puoi ripetere scegliendo una di queste aree?\n\n${Object.values(CATEGORY_MAP).map(v => `• ${v}`).join('\n')}`,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      setIsProcessing(false);
      setIsSydTyping(false);
      return;
    }
    
    try {
      // Chiama il backend per gli eventi
      const response = await fetch(`http://localhost:8000/events/${categoryKey}`);
      const data = await response.json();
      
      setSelectedCategory(categoryKey);
      setCurrentStep('event');
      
      // Raggruppa per tema
      const events = data.events || [];
      const privacyEvents = events.filter((e: string) => e.toLowerCase().includes('privacy') || e.toLowerCase().includes('dati'));
      const venditaEvents = events.filter((e: string) => e.toLowerCase().includes('vendita') || e.toLowerCase().includes('commerc'));
      const altriEvents = events.slice(0, 5); // Primi 5 per semplicità
      
      const aiMessage = `Ottimo! Per **${CATEGORY_MAP[categoryKey]}** ho trovato **${events.length} possibili rischi**.

**Dimmi una parola chiave** per essere più specifico, oppure scegli un tema:

${privacyEvents.length > 0 ? `📊 **Privacy e protezione dati** (${privacyEvents.length} rischi)` : ''}
${venditaEvents.length > 0 ? `💼 **Vendite e regole commerciali** (${venditaEvents.length} rischi)` : ''}
🔍 **Altri rischi comuni**

Oppure dimmi direttamente cosa ti preoccupa (es. "violazione privacy", "pagamenti non autorizzati")`;

      addMessage({
        id: `risk-events-${Date.now()}`,
        text: aiMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Errore nel caricamento eventi:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel caricamento degli eventi.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping]);

  // STEP 3: Gestisci la selezione dell'evento
  const handleEventSelection = useCallback(async (userInput: string) => {
    if (!selectedCategory) return;
    
    setIsProcessing(true);
    setIsSydTyping(true);
    
    try {
      // Ricarica gli eventi per trovare quello giusto
      const response = await fetch(`http://localhost:8000/events/${selectedCategory}`);
      const data = await response.json();
      const events = data.events || [];
      
      // Cerca l'evento che matcha con l'input
      const inputLower = userInput.toLowerCase();
      let matchedEvent = events.find((e: string) => {
        const eventLower = e.toLowerCase();
        return eventLower.includes(inputLower) || 
               (inputLower.includes('privacy') && eventLower.includes('privacy')) ||
               (inputLower.includes('prim') && events.indexOf(e) === 0);
      });
      
      if (!matchedEvent && inputLower.includes('privacy')) {
        // Se cerca privacy, prendi il primo che contiene privacy
        matchedEvent = events.find((e: string) => e.toLowerCase().includes('privacy'));
      }
      
      if (!matchedEvent) {
        // Mostra i primi 5 eventi
        const topEvents = events.slice(0, 5);
        addMessage({
          id: `risk-clarify-${Date.now()}`,
          text: `Ecco alcuni rischi in questa categoria:\n\n${topEvents.map((e: string, i: number) => {
            const [code, ...rest] = e.split(' - ');
            return `${i + 1}. **${code}** - ${rest.join(' - ').substring(0, 50)}...`;
          }).join('\n')}\n\nQuale ti interessa? (puoi dire "il primo", "il 505", ecc.)`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        setIsProcessing(false);
        setIsSydTyping(false);
        return;
      }
      
      // Ottieni la descrizione
      const descResponse = await fetch(`http://localhost:8000/description/${encodeURIComponent(matchedEvent)}`);
      const descData = await descResponse.json();
      
      const [eventCode, ...eventTitleParts] = matchedEvent.split(' - ');
      const eventTitle = eventTitleParts.join(' - ');
      
      setCurrentStep('description');
      
      const aiMessage = `📋 **ANALISI RISCHIO ${eventCode}**

**Categoria:** ${CATEGORY_MAP[selectedCategory]}
**Evento:** ${eventTitle}

**📄 Descrizione dettagliata:**
${descData.description}

**💡 Cosa significa per la tua azienda:**
Questo rischio potrebbe impattare le tue operazioni. È importante valutare:
• La probabilità che si verifichi nel tuo contesto
• L'impatto potenziale sulle attività
• Le misure preventive già in atto
• I controlli da implementare

Vuoi analizzare un altro rischio o cambiare categoria?`;

      addMessage({
        id: `risk-description-${Date.now()}`,
        text: aiMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      // Reset per nuovo ciclo
      setCurrentStep('idle');
      setSelectedCategory(null);
      
    } catch (error) {
      console.error('Errore nel caricamento descrizione:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel caricamento della descrizione.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
      setIsSydTyping(false);
    }
  }, [selectedCategory, addMessage, setIsSydTyping]);

  // Processa qualsiasi messaggio dell'utente
  const processUserMessage = useCallback(async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Se siamo in idle e l'utente parla di risk
    if (currentStep === 'idle' && (lowerMessage.includes('risk') || lowerMessage.includes('rischi'))) {
      await startRiskManagement();
      return;
    }
    
    // Se siamo in selezione categoria
    if (currentStep === 'category') {
      await handleCategorySelection(message);
      return;
    }
    
    // Se siamo in selezione evento
    if (currentStep === 'event') {
      await handleEventSelection(message);
      return;
    }
    
    // Se vuole ricominciare
    if (lowerMessage.includes('altra categoria') || lowerMessage.includes('cambia categoria')) {
      await startRiskManagement();
      return;
    }
    
    // Se vuole altro rischio nella stessa categoria
    if (selectedCategory && (lowerMessage.includes('altro rischio') || lowerMessage.includes('altri rischi'))) {
      await handleCategorySelection(CATEGORY_MAP[selectedCategory]);
      return;
    }
  }, [currentStep, selectedCategory, startRiskManagement, handleCategorySelection, handleEventSelection]);

  return {
    startRiskManagement,
    processUserMessage,
    isProcessing,
    currentStep
  };
};