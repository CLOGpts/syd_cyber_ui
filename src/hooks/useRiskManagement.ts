import { useState, useCallback } from 'react';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';
import * as riskAPI from '../api/riskManagement';

interface RiskFlowState {
  step: 'idle' | 'category_selection' | 'event_selection' | 'description_display';
  selectedCategory: string | null;
  selectedEvent: string | null;
  categories: riskAPI.RiskCategory[];
  events: riskAPI.RiskEvent[];
  description: string | null;
  conversationHistory: string[];
}

export const useRiskManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<RiskFlowState>({
    step: 'idle',
    selectedCategory: null,
    selectedEvent: null,
    categories: [],
    events: [],
    description: null,
    conversationHistory: []
  });

  const { addMessage } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  const startRiskAssessment = useCallback(async () => {
    setIsLoading(true);
    setIsSydTyping(true);

    try {
      const categories = await riskAPI.getRiskCategories();
      
      setFlowState(prev => ({
        ...prev,
        step: 'category_selection',
        categories,
        conversationHistory: []
      }));

      const introMessage = `🛡️ **Benvenuto nel modulo di Risk Management!**

Sono qui per aiutarti ad identificare e comprendere i rischi operativi della tua azienda. 
Questo strumento professionale è basato sulla mappatura dei rischi bancari validata da consulenti esperti.

**Quale categoria di rischio vuoi analizzare?**`;

      addMessage({
        id: `risk-intro-${Date.now()}`,
        text: introMessage,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'risk-management',
        riskData: {
          type: 'categories',
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.displayName,
            icon: cat.icon
          }))
        }
      });

    } catch (error) {
      console.error('Error starting risk assessment:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Si è verificato un errore nel caricamento del modulo Risk Management. Verifica che il server backend sia attivo.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping, flowState]);

  const selectCategory = useCallback(async (categoryInput: string) => {
    setIsLoading(true);
    setIsSydTyping(true);

    try {
      let categoryId = riskAPI.findCategoryByKeyword(categoryInput);
      
      if (!categoryId) {
        const matchingCategory = flowState.categories.find(cat => 
          cat.name.toLowerCase().includes(categoryInput.toLowerCase())
        );
        categoryId = matchingCategory?.id || null;
      }

      if (!categoryId) {
        addMessage({
          id: `risk-notfound-${Date.now()}`,
          text: `🤔 Non ho trovato una categoria corrispondente a "${categoryInput}". 
          
Prova con una di queste parole chiave:
• danni, incendio, allagamento
• sistema, IT, downtime
• dipendenti, personale, sicurezza lavoro
• esecuzione, consegna, produzione
• clienti, privacy, vendite
• frodi interne, furto interno
• frodi esterne, hacker, phishing`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const events = await riskAPI.getRiskEvents(categoryId);
      const categoryInfo = flowState.categories.find(c => c.id === categoryId);
      
      setFlowState(prev => ({
        ...prev,
        step: 'event_selection',
        selectedCategory: categoryId,
        events
      }));

      const groupedEvents = riskAPI.groupEventsByTheme(events);
      const themes = Object.keys(groupedEvents);
      
      let eventMessage = `${categoryInfo?.icon} **Categoria selezionata: ${categoryInfo?.displayName}**

Ho trovato **${events.length} possibili eventi di rischio** in questa categoria.

**Di quale area specifica vuoi parlare?**`;

      addMessage({
        id: `risk-events-${Date.now()}`,
        text: eventMessage,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'risk-management',
        riskData: {
          type: 'events',
          events: themes.slice(0, 6).map(theme => ({
            code: theme,
            theme: theme,
            count: groupedEvents[theme].length
          }))
        }
      });

    } catch (error) {
      console.error('Error selecting category:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel recupero degli eventi di rischio.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping, flowState]);

  const searchEvents = useCallback(async (keyword: string) => {
    if (!flowState.events || flowState.events.length === 0) {
      addMessage({
        id: `risk-noevents-${Date.now()}`,
        text: '⚠️ Devi prima selezionare una categoria di rischio.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setIsSydTyping(true);
    
    const matchingEvents = riskAPI.searchEventsByKeyword(flowState.events, keyword);
    
    if (matchingEvents.length === 0) {
      addMessage({
        id: `risk-nomatches-${Date.now()}`,
        text: `🔍 Non ho trovato eventi che contengono "${keyword}" in questa categoria. 
        
Prova con un termine diverso o chiedi di vedere tutti gli eventi.`,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } else if (matchingEvents.length === 1) {
      await selectEvent(matchingEvents[0].code);
    } else {
      const message = `🔍 **Risultati per "${keyword}":**\n\nHo trovato **${matchingEvents.length} eventi** correlati.\n\n📌 *Clicca su uno degli eventi per vedere i dettagli:*`;

      addMessage({
        id: `risk-search-${Date.now()}`,
        text: message,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'risk-management',
        riskData: {
          type: 'search_results',
          searchResults: matchingEvents.slice(0, 10).map(event => {
            const [code, ...titleParts] = event.code.split(' - ');
            return {
              code: event.code,
              title: titleParts.join(' - '),
              match: keyword
            };
          })
        }
      });
    }
    
    setIsSydTyping(false);
  }, [addMessage, setIsSydTyping, flowState]);

  const selectEvent = useCallback(async (eventIdentifier: string) => {
    setIsLoading(true);
    setIsSydTyping(true);

    try {
      let selectedEvent: riskAPI.RiskEvent | undefined;
      
      const codeMatch = eventIdentifier.match(/\d{3}/);
      if (codeMatch) {
        selectedEvent = flowState.events.find(e => 
          e.code.includes(codeMatch[0])
        );
      }
      
      if (!selectedEvent) {
        selectedEvent = flowState.events.find(e => 
          e.code.toLowerCase().includes(eventIdentifier.toLowerCase())
        );
      }

      if (!selectedEvent) {
        addMessage({
          id: `risk-eventnotfound-${Date.now()}`,
          text: `⚠️ Non ho trovato l'evento "${eventIdentifier}". 
          
Prova con il codice numerico (es. "505") o una parola chiave più specifica.`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const description = await riskAPI.getRiskDescription(selectedEvent.code);
      
      setFlowState(prev => ({
        ...prev,
        step: 'description_display',
        selectedEvent: selectedEvent.code,
        description
      }));

      const [eventCode, ...eventTitleParts] = selectedEvent.code.split(' - ');
      const categoryInfo = flowState.categories.find(c => c.id === flowState.selectedCategory);
      
      addMessage({
        id: `risk-description-${Date.now()}`,
        text: `📋 **Analisi del Rischio Completata**`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'risk-management',
        riskData: {
          type: 'description',
          description: {
            category: categoryInfo?.displayName || flowState.selectedCategory,
            categoryIcon: categoryInfo?.icon || '📋',
            eventCode: eventCode,
            eventTitle: eventTitleParts.join(' - '),
            description: description,
            impacts: [
              'Probabilità che questo evento si verifichi nel tuo contesto',
              'Impatto potenziale sulle tue attività',
              'Necessità di misure preventive'
            ],
            mitigations: [
              'Implementare controlli preventivi',
              'Monitoraggio continuo del rischio',
              'Piano di risposta agli incidenti'
            ]
          }
        }
      });

      setTimeout(() => {
        addMessage({
          id: `risk-continue-${Date.now()}`,
          text: `
🔄 **Cosa vuoi fare ora?**

• Analizzare un altro rischio nella stessa categoria
• Cambiare categoria di rischio
• Cercare un rischio specifico
• Terminare l'analisi

*Dimmi cosa ti interessa e continuerò ad assisterti!*
          `.trim(),
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
      }, 1000);

    } catch (error) {
      console.error('Error selecting event:', error);
      addMessage({
        id: `risk-error-${Date.now()}`,
        text: '❌ Errore nel recupero della descrizione del rischio.',
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping, flowState]);

  const processRiskMessage = useCallback(async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (flowState.step === 'category_selection') {
      await selectCategory(message);
    } else if (flowState.step === 'event_selection') {
      if (lowerMessage.includes('cambia categoria') || lowerMessage.includes('altra categoria')) {
        await startRiskAssessment();
      } else {
        await searchEvents(message);
      }
    } else if (flowState.step === 'description_display') {
      if (lowerMessage.includes('cambia categoria') || lowerMessage.includes('altra categoria')) {
        await startRiskAssessment();
      } else if (lowerMessage.includes('altro rischio') || lowerMessage.includes('cerca')) {
        await searchEvents(message.replace(/cerca|altro rischio/gi, '').trim());
      } else if (lowerMessage.includes('termina') || lowerMessage.includes('fine')) {
        addMessage({
          id: `risk-end-${Date.now()}`,
          text: '✅ Analisi dei rischi completata. Spero di essere stato utile! Se hai bisogno di ulteriori analisi, sono sempre disponibile.',
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        setFlowState({
          step: 'idle',
          selectedCategory: null,
          selectedEvent: null,
          categories: [],
          events: [],
          description: null,
          conversationHistory: []
        });
      } else {
        await searchEvents(message);
      }
    }
  }, [flowState, selectCategory, searchEvents, startRiskAssessment, addMessage]);

  const resetFlow = useCallback(() => {
    setFlowState({
      step: 'idle',
      selectedCategory: null,
      selectedEvent: null,
      categories: [],
      events: [],
      description: null,
      conversationHistory: []
    });
  }, []);

  return {
    startRiskAssessment,
    selectCategory,
    searchEvents,
    selectEvent,
    processRiskMessage,
    resetFlow,
    isLoading,
    flowState
  };
};