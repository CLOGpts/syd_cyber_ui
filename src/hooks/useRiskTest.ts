import { useChatStore } from '../store/useChat';

export const useRiskTest = () => {
  const { addMessage } = useChatStore();
  
  const testRisk = () => {
    console.log('🔴🔴🔴 TEST RISK CHIAMATO!');
    
    // AGGIUNGI SUBITO UN MESSAGGIO VISIBILE
    const msg = {
      id: `test-${Date.now()}`,
      text: '🔴 TEST: SE VEDI QUESTO, FUNZIONA!',
      sender: 'agent' as const,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Aggiungo messaggio:', msg);
    addMessage(msg);
    
    // Aggiungi un altro messaggio dopo 1 secondo
    setTimeout(() => {
      addMessage({
        id: `test2-${Date.now()}`,
        text: '✅ SECONDO MESSAGGIO: Ora scrivi "clienti" per continuare',
        sender: 'agent' as const,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  };
  
  return { testRisk };
};