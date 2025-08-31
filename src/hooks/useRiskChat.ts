import { useCallback } from 'react';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';

export const useRiskChat = () => {
  const { addMessage } = useChatStore();
  const { setIsSydTyping } = useAppStore();

  const startRiskConversation = useCallback(async () => {
    console.log('🎯 INIZIO CONVERSAZIONE RISK MANAGEMENT!');
    
    // SUBITO aggiungi il messaggio di benvenuto
    addMessage({
      id: `risk-welcome-${Date.now()}`,
      text: `🛡️ **Benvenuto nel Risk Management!**

Sono qui per aiutarti con l'analisi dei rischi operativi della tua azienda.

**Di quale tipo di rischio vuoi parlare?**

• 🔥 **Danni fisici** (incendi, terremoti, allagamenti)
• 💻 **Problemi informatici** (crash sistema, virus, downtime)
• 👥 **Dipendenti** (sicurezza lavoro, discriminazione)
• ⚙️ **Produzione** (errori consegna, difetti prodotto)
• 🤝 **Clienti** (privacy, vendite, reclami)
• 🔓 **Frodi interne** (furto dipendenti)
• 🚨 **Frodi esterne** (hacker, phishing)

💬 *Dimmi semplicemente cosa ti preoccupa, es: "privacy clienti" o "terremoto"*`,
      sender: 'agent',
      timestamp: new Date().toISOString()
    });

    // Poi chiama il backend (ma intanto il messaggio è già visibile!)
    try {
      const response = await fetch('http://localhost:8000/categories');
      const data = await response.json();
      console.log('✅ Categorie caricate:', data.total);
    } catch (error) {
      console.error('⚠️ Backend non raggiungibile, ma la chat funziona:', error);
    }
  }, [addMessage]);

  const handleRiskMessage = useCallback(async (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // Simula typing
    setIsSydTyping(true);
    
    setTimeout(async () => {
      let responseText = '';
      let categoryKey = null;
      
      // Determina la categoria dall'input
      if (input.includes('client') || input.includes('privacy')) {
        categoryKey = 'Clients_product_Clienti';
        responseText = `Ho capito, vuoi parlare di **rischi con i clienti**. `;
      } else if (input.includes('dann') || input.includes('incend') || input.includes('terremot')) {
        categoryKey = 'Damage_Danni';
        responseText = `Ho capito, vuoi parlare di **danni fisici e disastri**. `;
      } else if (input.includes('sistem') || input.includes('inform') || input.includes('computer')) {
        categoryKey = 'Business_disruption';
        responseText = `Ho capito, vuoi parlare di **problemi informatici**. `;
      }
      
      if (categoryKey) {
        try {
          const response = await fetch(`http://localhost:8000/events/${categoryKey}`);
          const data = await response.json();
          
          responseText += `\n\nHo trovato **${data.total} rischi** in questa categoria.\n\n`;
          
          // Mostra primi 3 eventi
          const events = data.events.slice(0, 3);
          responseText += `Ecco alcuni esempi:\n\n`;
          events.forEach((event: string, i: number) => {
            const [code, ...rest] = event.split(' - ');
            responseText += `${i+1}. **${code}** - ${rest.join(' - ').substring(0, 50)}...\n`;
          });
          
          responseText += `\n💬 *Quale vuoi approfondire? Dimmi il numero o una parola chiave più specifica.*`;
        } catch (error) {
          responseText += `\n\n⚠️ Non riesco a caricare i dettagli dal server, ma posso comunque aiutarti!`;
        }
      } else {
        responseText = `Non ho capito bene. Puoi dirmi di quale di questi rischi vuoi parlare?\n\n`;
        responseText += `• Danni fisici\n• Problemi informatici\n• Dipendenti\n• Produzione\n• Clienti\n• Frodi`;
      }
      
      addMessage({
        id: `risk-response-${Date.now()}`,
        text: responseText,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      setIsSydTyping(false);
    }, 1000); // Simula un po' di thinking time
  }, [addMessage, setIsSydTyping]);

  return {
    startRiskConversation,
    handleRiskMessage
  };
};