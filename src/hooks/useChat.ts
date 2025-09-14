
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

    // RESTRIZIONE: La chat principale è SOLO per Risk Management
    // Per domande generali, usa SYD Agent
    addMessage({
      id: `system-${Date.now()}`,
      text: "⚠️ **Questa chat è dedicata esclusivamente al Risk Management.**\n\nPer navigare i rischi:\n• Scrivi **'risk'** per iniziare\n• Scegli una categoria (es: clienti, danni, sistemi)\n• Seleziona un evento per numero o codice\n\n💡 **Per domande e assistenza generale, usa il bottone SYD in basso a destra.**",
      sender: 'agent',
      timestamp: new Date().toISOString(),
    });
    setIsSydTyping(false);
    return;
  }, [addMessage, setIsSydTyping, uploadedFiles, processATECO, handleRiskMessage, riskFlowStep, updateMessage, messages, setShowRiskReport]);

  return { sendMessage };
};
