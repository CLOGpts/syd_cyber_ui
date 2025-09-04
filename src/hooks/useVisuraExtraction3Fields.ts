/**
 * VISURA EXTRACTION - SOLO 3 CAMPI FONDAMENTALI
 * =============================================
 * DENOMINAZIONE | CODICE ATECO | OGGETTO SOCIALE
 * 
 * Sistema a 2 livelli:
 * 1. Backend Python (90% success)
 * 2. AI Chirurgica Gemini (10% fallback)
 */

import { useState } from 'react';
import { useVisuraStore } from '../store/useVisuraStore';

interface VisuraData3Fields {
  denominazione: string | null;
  ateco: string | null;
  oggetto_sociale: string | null;
  source: 'backend' | 'ai_assisted' | 'backend_only';
  confidence: number;
}

export const useVisuraExtraction3Fields = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<VisuraData3Fields | null>(null);
  
  const { setVisuraData, setExtractionStatus } = useVisuraStore();

  /**
   * ESTRAZIONE PRINCIPALE - 3 CAMPI FONDAMENTALI
   */
  const extractVisura3Fields = async (file: File): Promise<VisuraData3Fields | null> => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ESTRAZIONE VISURA - 3 CAMPI FONDAMENTALI');
    console.log('='.repeat(60));
    
    setIsExtracting(true);
    setExtractionStatus('extracting');

    try {
      // ========== LIVELLO 1: BACKEND PYTHON ==========
      console.log('🔧 Livello 1: Backend Python...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fields', JSON.stringify(['denominazione', 'ateco', 'oggetto_sociale']));

      const backendResponse = await fetch('/api/extract-visura-precise', {
        method: 'POST',
        body: formData
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        
        console.log('📥 Backend Response:', backendData);
        
        // Valida i dati ricevuti
        const isValid = validateExtractedData(backendData);
        
        if (isValid && backendData.confidence >= 0.7) {
          console.log('✅ BACKEND SUCCESS - Confidence:', (backendData.confidence * 100).toFixed(0) + '%');
          
          const result: VisuraData3Fields = {
            denominazione: cleanDenominazione(backendData.denominazione),
            ateco: formatAteco(backendData.ateco),
            oggetto_sociale: cleanOggettoSociale(backendData.oggetto_sociale),
            source: 'backend',
            confidence: backendData.confidence
          };
          
          updateStore(result);
          setExtractionResult(result);
          setExtractionStatus('completed');
          
          logFinalResult(result);
          return result;
        }
      }

      // ========== LIVELLO 2: AI CHIRURGICA ==========
      console.log('⚠️ Backend non sufficiente, attivo AI Chirurgica...');
      
      const aiResult = await extractWithAIChirurgica(file);
      
      if (aiResult) {
        console.log('🤖 AI CHIRURGICA SUCCESS');
        
        const result: VisuraData3Fields = {
          ...aiResult,
          source: 'ai_assisted'
        };
        
        updateStore(result);
        setExtractionResult(result);
        setExtractionStatus('completed');
        
        logFinalResult(result);
        return result;
      }

      // ========== FALLBACK: ERRORE ==========
      console.error('❌ ESTRAZIONE FALLITA - Né backend né AI hanno funzionato');
      setExtractionStatus('error');
      return null;

    } catch (error) {
      console.error('❌ Errore estrazione:', error);
      setExtractionStatus('error');
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * AI CHIRURGICA - Solo per fallback
   */
  const extractWithAIChirurgica = async (file: File): Promise<Partial<VisuraData3Fields> | null> => {
    try {
      // Converti PDF in testo base64
      const base64 = await fileToBase64(file);
      
      // Chiamata a Gemini con prompt PRECISO
      const response = await fetch('/api/gemini-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64,
          prompt: `
            ESTRAI ESATTAMENTE QUESTI 3 CAMPI dalla visura:
            1. DENOMINAZIONE: Nome azienda (NON "IN CIFRE")
            2. CODICE ATECO: Formato XX.XX o XX.XX.XX
            3. OGGETTO SOCIALE: Descrizione attività
            
            REGOLE:
            - NO INVENZIONI
            - Solo dati REALI dal documento
            - Se non trovi, metti null
            
            Rispondi SOLO in JSON.
          `
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          denominazione: data.denominazione,
          ateco: data.ateco,
          oggetto_sociale: data.oggetto_sociale,
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('❌ AI Chirurgica fallita:', error);
    }
    
    return null;
  };

  /**
   * VALIDAZIONE DATI ESTRATTI
   */
  const validateExtractedData = (data: any): boolean => {
    // Deve avere almeno 2 campi su 3
    let fieldsFound = 0;
    
    if (data.denominazione && 
        data.denominazione !== 'IN CIFRE' && 
        data.denominazione.length > 3) {
      fieldsFound++;
    }
    
    if (data.ateco && /^\d{2}\.\d{2}/.test(data.ateco)) {
      fieldsFound++;
    }
    
    if (data.oggetto_sociale && data.oggetto_sociale.length > 20) {
      fieldsFound++;
    }
    
    return fieldsFound >= 2;
  };

  /**
   * PULIZIA DENOMINAZIONE
   */
  const cleanDenominazione = (denominazione: string | null): string | null => {
    if (!denominazione) return null;
    
    // Rimuovi "IN CIFRE" e simili errori
    const blacklist = ['IN CIFRE', 'VISURA', 'CAMERA DI COMMERCIO'];
    
    for (const term of blacklist) {
      if (denominazione.toUpperCase().includes(term)) {
        console.warn(`⚠️ Denominazione invalida: ${denominazione}`);
        return null;
      }
    }
    
    return denominazione.trim();
  };

  /**
   * FORMATTA CODICE ATECO
   */
  const formatAteco = (ateco: string | null): string | null => {
    if (!ateco) return null;
    
    // Normalizza formato: XX.XX o XX.XX.XX
    const cleaned = ateco.replace(/\s/g, '.').replace(/\.+/g, '.');
    
    if (/^\d{2}\.\d{2}(?:\.\d{1,2})?$/.test(cleaned)) {
      return cleaned;
    }
    
    console.warn(`⚠️ ATECO non valido: ${ateco}`);
    return null;
  };

  /**
   * PULIZIA OGGETTO SOCIALE
   */
  const cleanOggettoSociale = (oggetto: string | null): string | null => {
    if (!oggetto || oggetto.length < 20) return null;
    
    // Rimuovi doppi spazi e caratteri strani
    const cleaned = oggetto
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Tronca se troppo lungo
    if (cleaned.length > 500) {
      return cleaned.substring(0, 500) + '...';
    }
    
    return cleaned;
  };

  /**
   * AGGIORNA STORE
   */
  const updateStore = (data: VisuraData3Fields) => {
    setVisuraData({
      denominazione: data.denominazione || '',
      codici_ateco: data.ateco ? [{ 
        codice: data.ateco, 
        descrizione: 'Attività principale',
        principale: true 
      }] : [],
      oggetto_sociale: data.oggetto_sociale || '',
      // Altri campi vuoti per ora
      forma_giuridica: '',
      partita_iva: '',
      codice_fiscale: '',
      numero_rea: '',
      camera_commercio: '',
      capitale_sociale: {
        deliberato: 0,
        sottoscritto: 0,
        versato: 0
      },
      sede_legale: {
        indirizzo: '',
        comune: '',
        provincia: '',
        cap: '',
        nazione: 'Italia'
      },
      pec: '',
      email: '',
      telefono: '',
      stato_attivita: '',
      data_costituzione: '',
      data_iscrizione_rea: '',
      tipo_business: 'B2B',
      amministratori: [],
      soci: [],
      unita_locali: [],
      sedi_secondarie: []
    });
  };

  /**
   * LOG RISULTATO FINALE
   */
  const logFinalResult = (result: VisuraData3Fields) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RISULTATO FINALE ESTRAZIONE');
    console.log('='.repeat(60));
    console.log(`Source: ${result.source}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`Denominazione: ${result.denominazione || 'NOT FOUND'}`);
    console.log(`ATECO: ${result.ateco || 'NOT FOUND'}`);
    console.log(`Oggetto Sociale: ${result.oggetto_sociale?.substring(0, 100) || 'NOT FOUND'}...`);
    console.log('='.repeat(60) + '\n');
  };

  /**
   * UTILITY: File to Base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    extractVisura3Fields,
    isExtracting,
    extractionResult
  };
};