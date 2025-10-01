
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

    const lowerText = text.toLowerCase();

    // 🎯 TYPEFORM UX: NON aggiungere messaggio utente se siamo in risk flow
    // Controlla PRIMA se siamo in risk flow
    console.log('🔍 useChat - Controllo risk flow. Step:', riskFlowStep, 'Testo:', lowerText);

    if (riskFlowStep !== 'idle') {
      // Siamo già nel flusso risk - NON aggiungere messaggio visibile
      console.log('📍 Risk flow attivo, processo senza messaggio visibile');
      const result = await handleRiskMessage(text);

      // Se il risultato è SHOW_REPORT, mostra il report
      if (result === 'SHOW_REPORT') {
        setShowRiskReport(true);
      }
      return;
    }

    // Controlla se l'utente vuole iniziare risk management
    if (lowerText.includes('risk') || lowerText.includes('rischi')) {
      console.log('🎯 Avvio Risk Flow - NO messaggio in chat');
      await handleRiskMessage(text);
      return;
    }

    // Controlla se l'utente vuole impostare ATECO
    if (lowerText.includes('imposta ateco') || lowerText.includes('importa ateco')) {
      // Aggiungi messaggio utente SOLO per ATECO
      const userMessage = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        role: 'user' as const
      };
      addMessage(userMessage);
      await processATECO();
      return;
    }

    // RESTRIZIONE: La chat principale è SOLO per Risk Management
    // Per domande generali, usa SYD Agent
    addMessage({
      id: `system-${Date.now()}`,
      text: "⚠️ **Questa chat è dedicata esclusivamente al Risk Management.**\n\nPer navigare i rischi:\n• Scrivi **'risk'** per iniziare\n• Scegli una categoria (es: clienti, danni, sistemi)\n• Seleziona un evento per numero o codice\n\n📊 **Analizza ATECO** - Nella sidebar a sinistra, inserisci il tuo codice ATECO e ottieni un PRE-REPORT immediato con rischi del settore e normative. Perfetto per prepararsi prima del Risk Management completo.\n\n💡 **Syd AI** - Non serve essere esperti! Usa il bottone in basso a destra e Syd ti guiderà passo passo nel pre-report, ti spiegherà i rischi in modo semplice e ti aiuterà a capire tutto!",
      sender: 'agent',
      timestamp: new Date().toISOString(),
    });
    setIsSydTyping(false);
    return;
  }, [addMessage, setIsSydTyping, uploadedFiles, processATECO, handleRiskMessage, riskFlowStep, updateMessage, messages, setShowRiskReport]);

  return { sendMessage };
};
