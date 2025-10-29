import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store';
import { useAppStore } from '../store/useStore';
import { fetchGeminiAteco } from '../api/gemini';
import type { ATECOResponseData } from '../components/chat/ATECOResponseCard';

export const useATECO = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage } = useChatStore();
  const { sessionMeta, updateSessionMeta } = useAppStore();

  const processATECO = useCallback(async (code?: string) => {
    const atecoCode = code || sessionMeta.ateco;
    
    console.log('🚀 useATECO processATECO chiamato:', {
      codeParam: code,
      sessionMetaAteco: sessionMeta.ateco,
      atecoCodeUsato: atecoCode
    });
    
    if (!atecoCode || atecoCode.trim() === '') {
      toast.error('Inserisci un codice ATECO valido');
      return null;
    }

    setIsLoading(true);
    const toastId = toast.loading('Ricerca codice ATECO in corso...', {
      style: {
        color: '#fff',
      },
      iconTheme: {
        primary: '#0EA5E9', // sky-500 - omogeneo con la grafica
        secondary: '#fff'
      }
    });

    try {
      // Step 1: Chiamata al backend per dati ufficiali (PostgreSQL)
      console.log('📡 Chiamata backend per codice:', atecoCode);
      const backendResponse = await fetch(
        `${import.meta.env.VITE_API_BASE}/ateco/lookup?code=${atecoCode}&prefer=2025`
      );
      const backendData = await backendResponse.json();

      let codice2022 = atecoCode;
      let titolo2022 = "";
      let codice2025 = atecoCode;
      let titolo2025 = "";
      let settoreBackend = "";
      let normativeBackend: string[] = [];
      let certificazioniBackend: string[] = [];
      
      // Estrai dati dal backend con struttura reale
      if (backendData.found > 0 && backendData.items && backendData.items.length > 0) {
        const item = backendData.items[0];
        codice2022 = item.CODICE_ATECO_2022 || atecoCode;
        titolo2022 = item.TITOLO_ATECO_2022 || "";
        codice2025 = item.CODICE_ATECO_2025_RAPPRESENTATIVO || atecoCode;
        titolo2025 = item.TITOLO_ATECO_2025_RAPPRESENTATIVO || "";
        settoreBackend = item.settore || "";
        normativeBackend = item.normative || [];
        certificazioniBackend = item.certificazioni || [];
      } else if (backendData.suggestions && backendData.suggestions.length > 0) {
        // Se non trova risultati ma ci sono suggerimenti
        const suggestionsText = backendData.suggestions
          .slice(0, 5)
          .map((s: any) => `• ${s.code}: ${s.title}`)
          .join('\n');
        
        addMessage({
          id: `suggestions-${Date.now()}`,
          text: `⚠️ Codice ATECO "${atecoCode}" non trovato.\n\n💡 Forse cercavi uno di questi?\n\n${suggestionsText}\n\nClicca su uno dei codici suggeriti per cercarlo.`,
          sender: 'agent',
          timestamp: new Date().toISOString()
        });
        
        toast.error('Codice non trovato, vedi i suggerimenti nella chat', { id: toastId });
        return null;
      }

      // Step 2: Chiamata a Gemini per arricchimento
      console.log('🤖 Chiamata Gemini per arricchimento...');
      const geminiData = await fetchGeminiAteco(
        codice2025 || codice2022, 
        backendData.found > 0 ? {
          ...backendData.items[0],
          settore_identificato: settoreBackend,
          normative_base: normativeBackend,
          certificazioni_base: certificazioniBackend
        } : null
      );

      // Step 3: Costruisci la struttura dati completa combinando backend + Gemini
      const atecoResponseData: ATECOResponseData = {
        lookup: {
          codice2022: codice2022 || atecoCode,
          titolo2022: titolo2022 || "Titolo non disponibile",
          codice2025: codice2025 || atecoCode,
          titolo2025: titolo2025 || "Titolo non disponibile"
        },
        arricchimento: geminiData?.arricchimento || 
          `Settore ${settoreBackend || 'da analizzare'}. ${titolo2025 || titolo2022}. Questo settore richiede un'analisi approfondita per identificare requisiti normativi e rischi specifici.`,
        // Combina normative dal backend + quelle aggiuntive da Gemini
        normative: [
          ...new Set([
            ...normativeBackend,
            ...(geminiData?.normative || [])
          ])
        ].slice(0, 12), // Limita a 12 normative
        // Combina certificazioni dal backend + quelle aggiuntive da Gemini
        certificazioni: [
          ...new Set([
            ...certificazioniBackend,
            ...(geminiData?.certificazioni || [])
          ])
        ].slice(0, 8), // Limita a 8 certificazioni
        rischi: geminiData?.rischi || {
          operativi: ["Interruzione dei processi critici", "Errori nella gestione operativa"],
          compliance: ["Non conformità normative", "Sanzioni amministrative"],
          cyber: ["Violazione dati sensibili", "Attacchi ransomware"],
          reputazionali: ["Perdita di fiducia dei clienti", "Danni all'immagine aziendale"]
        }
      };

      // Step 4: Aggiorna sessionMeta
      updateSessionMeta({
        ateco: codice2025 || codice2022 || atecoCode,
        settore: geminiData?.arricchimento?.substring(0, 100) || "Settore da analizzare",
        normative: atecoResponseData.normative.slice(0, 3).join(', '),
        certificazioni: atecoResponseData.certificazioni.slice(0, 3).join(', ')
      });

      // Step 5: Aggiungi messaggio strutturato alla chat
      addMessage({
        id: `ateco-${Date.now()}`,
        text: `Analisi ATECO ${codice2025 || codice2022} completata`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'ateco-response',
        atecoData: atecoResponseData
      });

      toast.success('Analisi ATECO completata con successo!', { id: toastId });
      return atecoResponseData;

    } catch (error) {
      console.error('❌ Errore durante l\'analisi ATECO:', error);
      toast.error('Errore durante l\'analisi del codice ATECO', { id: toastId });
      
      // Aggiungi messaggio di errore alla chat
      addMessage({
        id: `error-${Date.now()}`,
        text: `⚠️ Si è verificato un errore durante l'analisi del codice ATECO ${atecoCode}. Verifica che il codice sia corretto e riprova.`,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionMeta.ateco, addMessage, updateSessionMeta]);

  return {
    processATECO,
    isLoading
  };
};