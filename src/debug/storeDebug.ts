// DEBUG UTILITIES PER LA CONSOLE
export function setupStoreDebug() {
  if (typeof window === 'undefined') return;
  
  // Aggiungi funzioni di debug alla finestra
  (window as any).sydDebug = {
    // Mostra lo stato corrente
    showState: () => {
      const store = (window as any).__CHAT_STORE__;
      if (!store) {
        console.error('❌ CHAT Store not found!');
        return;
      }
      const state = store.getState();
      console.log('📊 CURRENT STATE:');
      console.log('Messages:', state.messages.length);
      console.log('Risk Step:', state.riskFlowStep);
      console.log('Risk Category:', state.riskSelectedCategory);
      console.log('Assessment Data:', state.riskAssessmentData);
      console.log('Full messages:', state.messages);
      return state;
    },
    
    // Aggiungi un messaggio di test
    addTestMessage: (text: string = 'Test message') => {
      const store = (window as any).__CHAT_STORE__;
      if (!store) {
        console.error('❌ CHAT Store not found!');
        return;
      }
      const msg = {
        id: `debug-${Date.now()}`,
        text,
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        role: 'user' as const
      };
      store.getState().addMessage(msg);
      console.log('✅ Added message:', msg);
    },
    
    // Pulisci tutti i messaggi
    clearAll: () => {
      const store = (window as any).__CHAT_STORE__;
      if (!store) {
        console.error('❌ CHAT Store not found!');
        return;
      }
      store.getState().clearMessages();
      console.log('✅ Messages cleared');
    },
    
    // Monitora i cambiamenti
    monitor: () => {
      const store = (window as any).__CHAT_STORE__;
      if (!store) {
        console.error('❌ CHAT Store not found!');
        return;
      }
      const unsubscribe = store.subscribe((state: any) => {
        console.log('📡 STATE CHANGED:', {
          messages: state.messages.length,
          lastMessage: state.messages[state.messages.length - 1],
          riskStep: state.riskFlowStep
        });
      });
      console.log('✅ Monitoring started. Call sydDebug.stopMonitor() to stop');
      (window as any).sydDebug.stopMonitor = unsubscribe;
    },
    
    // Ferma il monitoraggio
    stopMonitor: () => {
      console.log('Monitoring not active');
    }
  };
  
  console.log(`
🎮 SYD DEBUG TOOLS LOADED!
Available commands:
- sydDebug.showState() - Show current state
- sydDebug.addTestMessage('text') - Add test message
- sydDebug.clearAll() - Clear all messages
- sydDebug.monitor() - Start monitoring changes
- sydDebug.stopMonitor() - Stop monitoring
  `);
}