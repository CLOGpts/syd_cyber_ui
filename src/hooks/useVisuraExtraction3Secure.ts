/**
 * VISURA EXTRACTION - 3 CAMPI SICURI E VERIFICABILI
 * ==================================================
 * PARTITA IVA | CODICE ATECO | OGGETTO SOCIALE
 * 
 * NESSUNA INVENZIONE - SOLO DATI CERTI
 * Confidence REALE basata su validazioni concrete
 */

import { useState } from 'react';

interface SecureVisuraData {
  partita_iva: string | null;
  codice_ateco: string | null;
  oggetto_sociale: string | null;
  confidence: {
    score: number;
    details: {
      partita_iva: 'found' | 'not_found' | 'invalid';
      ateco: 'found' | 'not_found' | 'invalid_format';
      oggetto: 'found' | 'not_found' | 'too_short';
    };
    method: 'backend' | 'ai' | 'mixed';
    honest_assessment: string;
  };
}

export const useVisuraExtraction3Secure = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<SecureVisuraData | null>(null);

  /**
   * ESTRAZIONE SICURA - Solo 3 campi verificabili
   */
  const extractSecureFields = async (file: File): Promise<SecureVisuraData> => {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 ESTRAZIONE SICURA - 3 CAMPI VERIFICABILI');
    console.log('='.repeat(60));
    
    setIsExtracting(true);
    
    try {
      // Prepara FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Chiamata backend
      const response = await fetch('/api/extract-visura', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      // ESTRAI E VALIDA i 3 campi
      const result: SecureVisuraData = {
        partita_iva: null,
        codice_ateco: null,
        oggetto_sociale: null,
        confidence: {
          score: 0,
          details: {
            partita_iva: 'not_found',
            ateco: 'not_found',
            oggetto: 'not_found'
          },
          method: 'backend',
          honest_assessment: ''
        }
      };

      // 1. PARTITA IVA - Validazione RIGOROSA
      const piva = extractPartitaIVA(data);
      if (piva.valid) {
        result.partita_iva = piva.value;
        result.confidence.details.partita_iva = 'found';
        console.log('✅ P.IVA trovata e valida:', piva.value);
      } else if (piva.value) {
        result.confidence.details.partita_iva = 'invalid';
        console.log('⚠️ P.IVA trovata ma non valida:', piva.value);
      } else {
        console.log('❌ P.IVA non trovata');
      }

      // 2. CODICE ATECO - Formato preciso
      const ateco = extractATECO(data);
      if (ateco.valid) {
        result.codice_ateco = ateco.value;
        result.confidence.details.ateco = 'found';
        console.log('✅ ATECO trovato e valido:', ateco.value);
      } else if (ateco.value) {
        result.confidence.details.ateco = 'invalid_format';
        console.log('⚠️ ATECO trovato ma formato errato:', ateco.value);
      } else {
        console.log('❌ ATECO non trovato');
      }

      // 3. OGGETTO SOCIALE - Minimo 30 caratteri
      const oggetto = extractOggettoSociale(data);
      if (oggetto.valid) {
        result.oggetto_sociale = oggetto.value;
        result.confidence.details.oggetto = 'found';
        console.log('✅ Oggetto sociale trovato:', oggetto.value?.substring(0, 50) + '...');
      } else if (oggetto.value) {
        result.confidence.details.oggetto = 'too_short';
        console.log('⚠️ Oggetto sociale troppo corto');
      } else {
        console.log('❌ Oggetto sociale non trovato');
      }

      // CALCOLO CONFIDENCE ONESTO
      result.confidence = calculateHonestConfidence(result.confidence.details);
      
      // LOG FINALE ONESTO
      logHonestReport(result);
      
      setResult(result);
      return result;
      
    } catch (error) {
      console.error('❌ Errore estrazione:', error);
      return createEmptyResult('Errore di sistema');
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * ESTRAZIONE PARTITA IVA con validazione
   */
  const extractPartitaIVA = (data: any): { value: string | null; valid: boolean } => {
    // Cerca in vari campi possibili
    const possibleFields = [
      data.partita_iva,
      data.partitaIva,
      data.piva,
      data.vat,
      data.codice_fiscale // A volte coincide
    ];

    for (const field of possibleFields) {
      if (field && typeof field === 'string') {
        // Pulisci e valida
        const cleaned = field.replace(/\D/g, '');
        if (cleaned.length === 11 && /^\d{11}$/.test(cleaned)) {
          return { value: cleaned, valid: true };
        }
      }
    }

    return { value: null, valid: false };
  };

  /**
   * ESTRAZIONE ATECO con validazione formato
   */
  const extractATECO = (data: any): { value: string | null; valid: boolean } => {
    // Cerca nei vari formati possibili
    const sources = [
      data.codice_ateco,
      data.ateco,
      ...(data.codici_ateco || []),
      ...(data.ateco_details || [])
    ];

    for (const source of sources) {
      let ateco = null;
      
      if (typeof source === 'string') {
        ateco = source;
      } else if (source?.codice) {
        ateco = source.codice;
      }

      if (ateco) {
        // Normalizza formato
        const normalized = ateco.toString()
          .replace(/\s/g, '.')
          .replace(/[^\d.]/g, '')
          .replace(/\.+/g, '.');

        // Valida formato XX.XX o XX.XX.XX
        if (/^\d{2}\.\d{2}(\.\d{1,2})?$/.test(normalized)) {
          return { value: normalized, valid: true };
        }
      }
    }

    return { value: null, valid: false };
  };

  /**
   * ESTRAZIONE OGGETTO SOCIALE con validazione lunghezza
   */
  const extractOggettoSociale = (data: any): { value: string | null; valid: boolean } => {
    const possibleFields = [
      data.oggetto_sociale,
      data.oggettoSociale,
      data.attivita,
      data.descrizione_attivita
    ];

    for (const field of possibleFields) {
      if (field && typeof field === 'string') {
        // Pulisci
        const cleaned = field
          .replace(/\s+/g, ' ')
          .replace(/\\n/g, ' ')
          .trim();

        // Valida lunghezza minima (30 caratteri)
        if (cleaned.length >= 30) {
          // Tronca se troppo lungo
          const final = cleaned.length > 500 
            ? cleaned.substring(0, 500) + '...'
            : cleaned;
          
          return { value: final, valid: true };
        }
      }
    }

    return { value: null, valid: false };
  };

  /**
   * CALCOLO CONFIDENCE ONESTO
   */
  const calculateHonestConfidence = (details: any) => {
    let score = 0;
    let foundCount = 0;
    let validCount = 0;

    // Conta campi trovati e validi
    if (details.partita_iva === 'found') { foundCount++; validCount++; }
    else if (details.partita_iva === 'invalid') { foundCount++; }

    if (details.ateco === 'found') { foundCount++; validCount++; }
    else if (details.ateco === 'invalid_format') { foundCount++; }

    if (details.oggetto === 'found') { foundCount++; validCount++; }
    else if (details.oggetto === 'too_short') { foundCount++; }

    // Calcolo score ONESTO
    // 100% = tutti e 3 validi
    // 66% = 2 validi
    // 33% = 1 valido
    score = Math.round((validCount / 3) * 100);

    // Assessment onesto
    let assessment = '';
    if (validCount === 3) {
      assessment = '✅ Estrazione completa e affidabile';
    } else if (validCount === 2) {
      assessment = '⚠️ Estrazione parziale - 1 campo mancante o invalido';
    } else if (validCount === 1) {
      assessment = '⚠️ Estrazione insufficiente - Solo 1 campo valido';
    } else {
      assessment = '❌ Estrazione fallita - Nessun campo valido';
    }

    return {
      score: score,
      details: details,
      method: 'backend',
      honest_assessment: assessment
    };
  };

  /**
   * LOG REPORT ONESTO
   */
  const logHonestReport = (result: SecureVisuraData) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT ONESTO ESTRAZIONE');
    console.log('='.repeat(60));
    
    console.log('CAMPI ESTRATTI:');
    console.log(`  P.IVA: ${result.partita_iva || 'NON TROVATA'} [${result.confidence.details.partita_iva}]`);
    console.log(`  ATECO: ${result.codice_ateco || 'NON TROVATO'} [${result.confidence.details.ateco}]`);
    console.log(`  Oggetto: ${result.oggetto_sociale ? 'TROVATO' : 'NON TROVATO'} [${result.confidence.details.oggetto}]`);
    
    console.log('\nCONFIDENCE REALE:');
    console.log(`  Score: ${result.confidence.score}%`);
    console.log(`  Assessment: ${result.confidence.honest_assessment}`);
    console.log('='.repeat(60) + '\n');
  };

  /**
   * CREA RISULTATO VUOTO
   */
  const createEmptyResult = (reason: string): SecureVisuraData => {
    return {
      partita_iva: null,
      codice_ateco: null,
      oggetto_sociale: null,
      confidence: {
        score: 0,
        details: {
          partita_iva: 'not_found',
          ateco: 'not_found',
          oggetto: 'not_found'
        },
        method: 'backend',
        honest_assessment: `❌ ${reason}`
      }
    };
  };

  return {
    extractSecureFields,
    isExtracting,
    result
  };
};