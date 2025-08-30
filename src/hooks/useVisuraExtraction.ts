import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useStore';
import { useChatStore } from '../store/useChat';

interface VisuraData {
  codici_ateco: string[];
  oggetto_sociale: string;
  sedi: {
    sede_legale: any;
    unita_locali: any[];
  };
  tipo_business: 'B2B' | 'B2C' | 'B2B/B2C';
  confidence: number;
  extraction_method: 'backend' | 'ai' | 'chat';
}

export const useVisuraExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    status: 'idle' | 'extracting' | 'success' | 'error';
    method?: 'backend' | 'ai' | 'chat';
    message?: string;
  }>({ status: 'idle' });
  
  const { setSessionMeta } = useAppStore();
  const { addMessage } = useChatStore();

  /**
   * LIVELLO 1: Backend Python (veloce e preciso)
   */
  const extractWithBackend = async (file: File): Promise<VisuraData | null> => {
    try {
      console.log('🔧 Tentativo 1: Backend Python per estrazione visura...');
      setExtractionStatus({ status: 'extracting', method: 'backend' });
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_VISURA_API_BASE || 'http://localhost:8000'}/api/extract-visura`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.confidence > 0.7) {
        console.log('✅ Backend extraction successful!', result.data);
        return { ...result.data, extraction_method: 'backend' };
      }

      // Se confidence bassa, passa al livello 2
      console.log('⚠️ Backend confidence bassa, passo a AI...');
      return null;
      
    } catch (error) {
      console.error('❌ Backend extraction failed:', error);
      return null;
    }
  };

  /**
   * LIVELLO 2: AI Diretta (Gemini/GPT per parsing)
   */
  const extractWithAI = async (file: File): Promise<VisuraData | null> => {
    try {
      console.log('🤖 Tentativo 2: AI per estrazione visura...');
      setExtractionStatus({ status: 'extracting', method: 'ai' });
      
      // Converti PDF in base64 per invio a AI
      const base64 = await fileToBase64(file);
      
      // Prompt strutturato per Gemini
      const prompt = `
        Analizza questa visura camerale ed estrai:
        1. Tutti i codici ATECO (formato XX.XX.XX)
        2. L'oggetto sociale completo
        3. Sede legale e unità locali
        4. Tipo di business (B2B, B2C o misto)
        
        Rispondi SOLO in JSON con questa struttura esatta:
        {
          "codici_ateco": ["..."],
          "oggetto_sociale": "...",
          "sedi": {
            "sede_legale": {...},
            "unita_locali": [...]
          },
          "tipo_business": "B2B|B2C|B2B/B2C"
        }
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { 
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('AI extraction failed');
      }

      const result = await response.json();
      const text = result.candidates[0]?.content?.parts[0]?.text;
      
      // Estrai JSON dalla risposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        console.log('✅ AI extraction successful!', data);
        return { 
          ...data, 
          confidence: 0.85,
          extraction_method: 'ai' 
        };
      }

      throw new Error('AI response not valid JSON');
      
    } catch (error) {
      console.error('❌ AI extraction failed:', error);
      toast.error('Estrazione automatica fallita. Carica il file nella chat per assistenza manuale.');
      return null;
    }
  };

  /**
   * LIVELLO 3: Chat con allegato (interazione umana + AI)
   */
  const setupChatFallback = useCallback((file: File) => {
    console.log('💬 Tentativo 3: Suggerimento upload via chat...');
    
    // Aggiungi messaggio di aiuto nella chat
    addMessage({
      id: Date.now().toString(),
      text: `Ho notato che stai cercando di caricare una visura camerale ma l'estrazione automatica non è riuscita. 

📎 **Puoi allegare il file direttamente qui nella chat** e ti aiuterò io ad estrarre i dati!

Trascina il file qui o usa il pulsante di allegato per procedere manualmente.`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
    });

    // Mostra notifica
    toast('💡 Suggerimento: Allega la visura nella chat per assistenza manuale', {
      duration: 6000,
      icon: '📎',
    });
  }, [addMessage]);

  /**
   * Funzione principale che orchestra i 3 livelli
   */
  const extractVisuraData = useCallback(async (file: File): Promise<boolean> => {
    // Verifica che sia una visura
    const isVisura = file.name.toLowerCase().includes('visura') || 
                     file.name.toLowerCase().includes('camerale') ||
                     file.name.toLowerCase().includes('cciaa');
    
    if (!isVisura && file.type === 'application/pdf') {
      // Chiedi conferma se è una visura
      const confirmVisura = window.confirm('Questo PDF potrebbe essere una visura camerale. Vuoi estrarre i dati aziendali?');
      if (!confirmVisura) return false;
    }

    setIsExtracting(true);
    toast.loading('Estrazione dati visura in corso...', { id: 'visura-extraction' });

    try {
      // LIVELLO 1: Prova con backend Python
      let data = await extractWithBackend(file);
      
      // LIVELLO 2: Se backend fallisce, prova con AI
      if (!data) {
        data = await extractWithAI(file);
      }
      
      // LIVELLO 3: Se anche AI fallisce, suggerisci chat
      if (!data) {
        setupChatFallback(file);
        toast.dismiss('visura-extraction');
        return false;
      }

      // Successo! Popola i dati
      populateExtractedData(data);
      
      setExtractionStatus({ 
        status: 'success', 
        method: data.extraction_method,
        message: `Estratti ${data.codici_ateco.length} codici ATECO con confidenza ${Math.round(data.confidence * 100)}%`
      });
      
      toast.success(
        `✅ Dati estratti con successo! (Metodo: ${data.extraction_method})`,
        { id: 'visura-extraction' }
      );
      
      // Reset status dopo 5 secondi
      setTimeout(() => {
        setExtractionStatus({ status: 'idle' });
      }, 5000);

      return true;

    } catch (error) {
      console.error('Errore estrazione visura:', error);
      setExtractionStatus({ 
        status: 'error', 
        message: 'Estrazione fallita. Usa la chat per assistenza.'
      });
      toast.error('Errore durante l\'estrazione', { id: 'visura-extraction' });
      setupChatFallback(file);
      
      // Reset status dopo 5 secondi
      setTimeout(() => {
        setExtractionStatus({ status: 'idle' });
      }, 5000);
      
      return false;
      
    } finally {
      setIsExtracting(false);
    }
  }, [setupChatFallback]);

  /**
   * Popola i dati estratti nel form
   */
  const populateExtractedData = (data: VisuraData) => {
    // Aggiorna session meta con i dati estratti
    const currentMeta = useAppStore.getState().sessionMeta;
    
    setSessionMeta({
      ...currentMeta,
      ateco: data.codici_ateco[0] || currentMeta.ateco,
      allAtecoCodes: data.codici_ateco,
      businessMission: data.oggetto_sociale,
      sede_legale: data.sedi.sede_legale,
      unita_locali: data.sedi.unita_locali,
      businessType: data.tipo_business,
      extractionMethod: data.extraction_method,
      extractionConfidence: data.confidence,
    });

    // Aggiungi messaggio di conferma nella chat
    addMessage({
      id: Date.now().toString(),
      text: `✅ **Visura elaborata con successo!**

**Codici ATECO trovati:** ${data.codici_ateco.join(', ')}
**Tipo Business:** ${data.tipo_business}
**Metodo estrazione:** ${data.extraction_method === 'backend' ? 'Analisi strutturata' : 'Intelligenza artificiale'}
**Confidenza:** ${Math.round(data.confidence * 100)}%

I dati sono stati popolati automaticamente. Puoi procedere con l'analisi BIA.`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Helper: converti file in base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Rimuovi il prefisso data:application/pdf;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
  };

  return {
    extractVisuraData,
    isExtracting,
    extractionStatus,
  };
};