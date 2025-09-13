
import { useCallback } from 'react';
import { useAppStore, useChatStore } from '../store';
import { sendMessage as sendApiMessage } from '../api/assistant';
import { useATECO } from './useATECO';
import { useRiskFlow } from './useRiskFlow';

export const useChat = () => {
  const {
    updateLastAgentMessage,
    setIsSydTyping,
    uploadedFiles,
    setShowRiskReport,
  } = useAppStore();
  
  const { addMessage, updateMessage, messages, riskFlowStep } = useChatStore();
  const { processATECO } = useATECO();
  const { handleUserMessage: handleRiskMessage } = useRiskFlow();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Aggiungi messaggio utente
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
      role: 'user' as const  // IMPORTANTE: aggiungi role
    };
    console.log('📝 SALVANDO MESSAGGIO:', userMessage);
    addMessage(userMessage);
    
    // Verifica subito se è stato salvato - accedi direttamente al vanilla store
    setTimeout(() => {
      const g = globalThis as any;
      if (g.__CHAT_STORE__) {
        const state = g.__CHAT_STORE__.getState();
        console.log('✅ MESSAGGI NEL VANILLA STORE:', state.messages.length);
      }
    }, 100);

    // Controlla se l'utente vuole impostare ATECO
    const lowerText = text.toLowerCase();
    if (lowerText.includes('imposta ateco') || lowerText.includes('importa ateco')) {
      // Usa la vera logica ATECO invece della risposta fake
      await processATECO();
      return;
    }

    // Controlla se siamo in un flusso risk attivo O se l'utente ne parla
    console.log('🔍 useChat - Controllo risk flow. Step:', riskFlowStep, 'Testo:', lowerText);
    
    if (riskFlowStep !== 'idle') {
      // Siamo già nel flusso, continua
      console.log('📍 Risk flow attivo, invio a handleRiskMessage');
      const result = await handleRiskMessage(text);
      
      // Se il risultato è SHOW_REPORT, mostra il report
      if (result === 'SHOW_REPORT') {
        setShowRiskReport(true);
      }
      return;
    }
    
    // Controlla se l'utente vuole iniziare risk management
    if (lowerText.includes('risk') || lowerText.includes('rischi')) {
      console.log('📍 Parola chiave risk trovata, avvio risk flow');
      await handleRiskMessage(text);
      return;
    }

    // Per altri messaggi, usa la logica esistente
    setIsSydTyping(true);
    const agentMessage = {
      id: `agent-${Date.now()}`,
      text: '',
      sender: 'agent' as const,
      timestamp: new Date().toISOString(),
    };
    addMessage(agentMessage);

    try {
      const stream = sendApiMessage(text, uploadedFiles);
      for await (const chunk of stream) {
        // Aggiorna l'ultimo messaggio agent usando updateMessage
        const currentText = messages.find(m => m.id === agentMessage.id)?.text || '';
        updateMessage(agentMessage.id, {
          text: currentText + chunk
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        id: `error-${Date.now()}`,
        text: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping, uploadedFiles, processATECO, handleRiskMessage, riskFlowStep]);

  return { sendMessage };
};
