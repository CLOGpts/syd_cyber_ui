import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChat';
import { useAppStore } from '../store/useStore';
import type { ATECOResponseData } from '../components/chat/ATECOResponseCard';

interface BatchResult {
  code: string;
  found: boolean;
  data?: any;
  error?: string;
}

export const useBatchATECO = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { addMessage } = useChatStore();

  const processBatch = useCallback(async (codes: string[]) => {
    if (!codes || codes.length === 0) {
      toast.error('Nessun codice ATECO da processare');
      return [];
    }

    // Pulisci e filtra codici vuoti
    const cleanCodes = codes
      .map(code => code.trim())
      .filter(code => code.length > 0);

    if (cleanCodes.length === 0) {
      toast.error('Nessun codice ATECO valido trovato');
      return [];
    }

    setIsLoading(true);
    setProgress({ current: 0, total: cleanCodes.length });
    const toastId = toast.loading(`Processando ${cleanCodes.length} codici ATECO...`);

    try {
      // Dividi in batch di 50 (limite backend)
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < cleanCodes.length; i += batchSize) {
        batches.push(cleanCodes.slice(i, i + batchSize));
      }

      const allResults: BatchResult[] = [];

      // Processa ogni batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codes: batch })
        });

        if (!response.ok) {
          throw new Error(`Errore batch: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Processa risultati del batch
        for (let i = 0; i < batch.length; i++) {
          const code = batch[i];
          const result = data.results?.[i];
          
          if (result && result.found > 0) {
            allResults.push({
              code,
              found: true,
              data: result.items[0]
            });
          } else {
            allResults.push({
              code,
              found: false,
              error: 'Codice non trovato'
            });
          }

          // Aggiorna progress
          const currentProgress = batchIndex * batchSize + i + 1;
          setProgress({ current: currentProgress, total: cleanCodes.length });
          toast.loading(
            `Processando ${currentProgress}/${cleanCodes.length} codici...`,
            { id: toastId }
          );
        }
      }

      // Genera report risultati
      const foundCount = allResults.filter(r => r.found).length;
      const notFoundCount = allResults.filter(r => !r.found).length;

      // Crea messaggio riepilogativo
      const summaryMessage = `
📊 **Risultati Batch Import ATECO**

✅ **Trovati**: ${foundCount} codici
❌ **Non trovati**: ${notFoundCount} codici
📁 **Totale processati**: ${allResults.length} codici

**Dettagli codici trovati:**
${allResults
  .filter(r => r.found)
  .slice(0, 10)
  .map(r => `• ${r.code}: ${r.data?.TITOLO_ATECO_2025_RAPPRESENTATIVO || r.data?.TITOLO_ATECO_2022 || 'N/D'}`)
  .join('\n')}
${foundCount > 10 ? `\n...e altri ${foundCount - 10} codici` : ''}

${notFoundCount > 0 ? `\n**Codici non trovati:**\n${allResults
  .filter(r => !r.found)
  .slice(0, 5)
  .map(r => `• ${r.code}`)
  .join('\n')}${notFoundCount > 5 ? `\n...e altri ${notFoundCount - 5} codici` : ''}` : ''}
      `.trim();

      // Aggiungi messaggio alla chat
      addMessage({
        id: `batch-${Date.now()}`,
        text: summaryMessage,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });

      toast.success(
        `Completato! ${foundCount} trovati, ${notFoundCount} non trovati`,
        { id: toastId }
      );

      return allResults;

    } catch (error) {
      console.error('❌ Errore batch processing:', error);
      toast.error('Errore durante il processing batch', { id: toastId });
      
      addMessage({
        id: `batch-error-${Date.now()}`,
        text: `⚠️ Si è verificato un errore durante il processing batch dei codici ATECO. Verifica la connessione e riprova.`,
        sender: 'agent',
        timestamp: new Date().toISOString()
      });
      
      return [];
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [addMessage]);

  // Funzione per processare un file CSV/TXT
  const processFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      
      // Estrai codici dal testo (uno per riga o separati da virgola)
      const codes = text
        .split(/[\n,;]/)
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (codes.length === 0) {
        toast.error('Nessun codice ATECO trovato nel file');
        return [];
      }

      toast(`Trovati ${codes.length} codici nel file`, { icon: 'ℹ️' });
      return await processBatch(codes);
      
    } catch (error) {
      console.error('Errore lettura file:', error);
      toast.error('Errore durante la lettura del file');
      return [];
    }
  }, [processBatch]);

  return {
    processBatch,
    processFile,
    isLoading,
    progress
  };
};