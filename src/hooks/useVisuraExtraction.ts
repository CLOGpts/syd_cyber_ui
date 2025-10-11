import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useStore';
import { useChatStore } from '../store';
import { useVisuraStore } from '../store/useVisuraStore';
import type { VisuraData, VisuraExtractionResponse, SeismicData } from '../types/visura.types';
import { emergencyDataFix } from '../data/visuraFallback';

/**
 * Retry logic per chiamate Gemini AI con exponential backoff
 * Risolve problemi di 503 intermittenti
 */
async function callGeminiWithRetry(
  url: string,
  payload: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativo ${attempt}/${maxRetries} chiamata Gemini AI...`);
      const response = await fetch(url, payload);

      // Se la risposta è OK, ritorna immediatamente
      if (response.ok) {
        console.log(`✅ Gemini AI risposta OK al tentativo ${attempt}`);
        return response;
      }

      // Se è 503 e non è l'ultimo tentativo, riprova
      if (response.status === 503 && attempt < maxRetries) {
        const waitTime = 1000 * Math.pow(2, attempt - 1); // exponential backoff: 1s, 2s, 4s
        console.warn(`⚠️ Gemini AI 503 al tentativo ${attempt}, riprovo tra ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Altri errori HTTP
      throw new Error(`Gemini API HTTP ${response.status}`);

    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Errore al tentativo ${attempt}:`, error);

      // Se non è l'ultimo tentativo, aspetta e riprova
      if (attempt < maxRetries) {
        const waitTime = 1000 * Math.pow(2, attempt - 1);
        console.log(`🔄 Riprovo tra ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }

  // Se arriviamo qui, tutti i tentativi sono falliti
  throw lastError || new Error('Gemini AI failed after all retries');
}

/**
 * Detecta se un testo è stato troncato analizzando indizi di incompletezza
 */
const isTextTruncated = (text: string | null | undefined): boolean => {
  if (!text) return false;
  
  const trimmedText = text.trim();
  
  // Lista di indicatori di troncamento comune
  const truncationIndicators = [
    // Frasi incomplete tipiche
    /\bE LA$/i,           // "...E LA"
    /\bE IL$/i,           // "...E IL" 
    /\bDELLA$/i,          // "...DELLA"
    /\bDEL$/i,            // "...DEL"
    /\bCON$/i,            // "...CON"
    /\bPER$/i,            // "...PER"
    /\bNEL$/i,            // "...NEL"
    /\bSUL$/i,            // "...SUL"
    /\bALLA$/i,           // "...ALLA"
    /\bAL$/i,             // "...AL"
    /\bUNA$/i,            // "...UNA"
    /\bUN$/i,             // "...UN"
    
    // Congiunzioni e preposizioni che indicano continuazione
    /\bE\s*$/i,           // "...E "
    /\bO\s*$/i,           // "...O "
    /\bMA\s*$/i,          // "...MA "
    /\bCHE\s*$/i,         // "...CHE "
    /\bDI\s*$/i,          // "...DI "
    /\bA\s*$/i,           // "...A "
    /\bDA\s*$/i,          // "...DA "
    /\bIN\s*$/i,          // "...IN "
    /\bSU\s*$/i,          // "...SU "
    
    // Frasi che indicano elenchi o continuazioni
    /\bATTIVITA\'\s*$/i,  // "...ATTIVITÀ"
    /\bATTIVITA\s*$/i,    // "...ATTIVITA"
    /\bSERVIZI\s*$/i,     // "...SERVIZI"
    /\bPRODOTTI\s*$/i,    // "...PRODOTTI"
    
    // Pattern di interruzione a metà parola
    /[A-Z][a-z]+\s+[A-Z]$/,  // "...Parola P" (parola interrotta)
    
    // Frasi che finiscono con virgola o due punti
    /[,:]\s*$/,              // "..., " o "...: "
  ];
  
  // Controlla ogni indicatore
  for (const indicator of truncationIndicators) {
    if (indicator.test(trimmedText)) {
      console.log('🔍 Troncamento rilevato con pattern:', indicator.toString());
      return true;
    }
  }
  
  // Controlla lunghezza sospettosamente corta per oggetto sociale
  if (trimmedText.length < 30) {
    console.log('🔍 Troncamento rilevato per lunghezza insufficiente:', trimmedText.length);
    return true;
  }
  
  // Controlla se finisce con una parola molto comune che indica continuazione
  const commonIncompleteWords = [
    'LA', 'IL', 'E', 'DI', 'A', 'DA', 'IN', 'CON', 'PER', 'SU', 'TRA', 'FRA'
  ];
  const lastWord = trimmedText.split(' ').pop()?.toUpperCase();
  if (lastWord && commonIncompleteWords.includes(lastWord)) {
    console.log('🔍 Troncamento rilevato per parola finale comune:', lastWord);
    return true;
  }
  
  return false;
};

export const useVisuraExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    status: 'idle' | 'extracting' | 'success' | 'error';
    method?: 'backend' | 'ai' | 'chat' | 'regex' | 'mixed';
    message?: string;
  }>({ status: 'idle' });

  const { updateSessionMeta } = useAppStore();
  const { addMessage } = useChatStore();
  const { setVisuraData, clearVisuraData, setExtractionStatus: setVisuraStatus } = useVisuraStore();

  /**
   * Fetch seismic zone data from backend
   */
  const fetchSeismicZone = async (comune: string, provincia: string): Promise<SeismicData | null> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      console.log('🌍 Fetching seismic zone:', { comune, provincia, backendUrl });
      const response = await fetch(
        `${backendUrl}/seismic-zone/${encodeURIComponent(comune)}?provincia=${provincia}`
      );

      if (!response.ok) {
        console.warn('Seismic zone not found for:', comune, provincia);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.warn('Seismic API error:', data.message);
        return null;
      }

      return data as SeismicData;
    } catch (error) {
      console.error('Error fetching seismic zone:', error);
      return null;
    }
  };

  /**
   * Adapter per convertire struttura vecchia backend a nuova
   */
  const adaptBackendData = (oldData: any): VisuraData => {
    console.log('🔄 Adattamento dati backend - DATI RAW COMPLETI:', JSON.stringify(oldData, null, 2));
    
    // Log tutte le chiavi disponibili
    console.log('🔑 Chiavi disponibili nel backend:', Object.keys(oldData));
    
    // 🔧 FIX IMMEDIATI PRIMA DI TUTTO
    // Fix provincia per comuni noti
    const comuneUpper = oldData.sede_legale?.comune?.toUpperCase() || 
                        oldData.sedi?.sede_legale?.citta?.toUpperCase() || '';
    
    // Database comuni-province ESTESO
    const comuniProvince: Record<string, string> = {
      'BOSCONERO': 'TO',
      'TORINO': 'TO',
      'MILANO': 'MI', 
      'ROMA': 'RM',
      'NAPOLI': 'NA',
      'PALERMO': 'PA',
      'GENOVA': 'GE',
      'BOLOGNA': 'BO',
      'FIRENZE': 'FI',
      'VENEZIA': 'VE'
    };
    
    // Se il comune è noto, correggi la provincia
    if (comuniProvince[comuneUpper]) {
      const provinciaCorretta = comuniProvince[comuneUpper];
      if (oldData.sede_legale && oldData.sede_legale.provincia !== provinciaCorretta) {
        console.log(`✅ FIX: Provincia ${comuneUpper}: ${oldData.sede_legale.provincia} → ${provinciaCorretta}`);
        oldData.sede_legale.provincia = provinciaCorretta;
      }
      if (oldData.sedi?.sede_legale && oldData.sedi.sede_legale.provincia !== provinciaCorretta) {
        oldData.sedi.sede_legale.provincia = provinciaCorretta;
      }
    }
    
    // FIX: rimuovi "di " dal comune se presente
    if (oldData.sede_legale?.comune?.startsWith('di ')) {
      oldData.sede_legale.comune = oldData.sede_legale.comune.substring(3);
    }
    
    // Fix amministratori ASSURDI
    if (oldData.amministratori && Array.isArray(oldData.amministratori)) {
      const amministratoriValidi = oldData.amministratori.filter((a: any) => {
        const nome = a.nome_completo || '';
        // Escludi frasi assurde
        const frasiDaEscludere = [
          'ALTO VALORE',
          'OGGETTO',
          'EURO',
          'Data atto',
          'OGNI AUTORITA',
          'ri riassuntivi',
          'detti al',
          'enza esercizi'
        ];
        return nome.length > 3 && 
               nome.length < 50 && 
               !frasiDaEscludere.some(f => nome.includes(f)) &&
               /^[A-Z][a-z]+ [A-Z]/.test(nome); // Formato Nome Cognome
      });
      
      // Se non ci sono amministratori validi, metti placeholder
      if (amministratoriValidi.length === 0) {
        oldData.amministratori = [];
        console.log('⚠️ FIX: Amministratori non validi, rimossi');
      } else {
        oldData.amministratori = amministratoriValidi;
      }
    }
    
    // Fix ATECO che ha "ATECO: " nel codice
    if (oldData.codici_ateco && Array.isArray(oldData.codici_ateco)) {
      oldData.codici_ateco = oldData.codici_ateco.map((ateco: any) => {
        if (ateco.codice && ateco.codice.includes('ATECO')) {
          ateco.codice = ateco.codice.replace(/ATECO[:\s]*/gi, '').trim();
        }
        // Usa codice_puro se disponibile
        if (ateco.codice_puro) {
          ateco.codice = ateco.codice_puro;
        }
        return ateco;
      });
      console.log('✅ FIX: Codici ATECO puliti');
    }
    
    // Fix REA - aggiungi prefisso provincia CORRETTO
    if (oldData.numero_rea) {
      // Rimuovi qualsiasi prefisso errato come "LE-TO"
      let reaClean = oldData.numero_rea.replace(/^[A-Z]{2}-[A-Z]{2}/, ''); // rimuovi LE-TO
      reaClean = reaClean.replace(/^[A-Z]{2}-/, ''); // rimuovi prefisso singolo
      reaClean = reaClean.replace(/[^0-9]/g, ''); // tieni solo numeri
      
      // Usa la provincia CORRETTA
      const prov = oldData.sede_legale?.provincia || 
                   oldData.sedi?.sede_legale?.provincia || 'TO';
      
      // Ricostruisci REA corretto
      oldData.numero_rea = `${prov}-${reaClean}`;
      console.log('✅ FIX: REA pulito e con prefisso corretto:', oldData.numero_rea);
    }
    
    // Fix tipo business basato su ATECO e forma giuridica
    const primoAteco = oldData.codici_ateco?.[0]?.codice || '';
    const formaGiuridica = oldData.forma_giuridica?.toUpperCase() || '';
    
    // Logica intelligente per tipo business
    if (primoAteco.startsWith('62.') || primoAteco.startsWith('63.')) {
      // Software/IT → sempre B2B
      oldData.tipo_business = 'B2B';
      console.log('✅ FIX: Tipo business IT/Software → B2B');
    } else if (primoAteco.startsWith('66.') || primoAteco.startsWith('64.') || primoAteco.startsWith('65.')) {
      // Finanza/Banche/Assicurazioni → B2B
      oldData.tipo_business = 'B2B';
      console.log('✅ FIX: Tipo business Finanza → B2B');
    } else if (formaGiuridica.includes('SIM') || formaGiuridica.includes('SGR')) {
      // SIM/SGR → sempre B2B
      oldData.tipo_business = 'B2B';
      console.log('✅ FIX: Tipo business SIM/SGR → B2B');
    } else if (primoAteco.startsWith('47.')) {
      // Commercio al dettaglio → B2C
      oldData.tipo_business = 'B2C';
    }
    
    // Gestisci codici ATECO - PRENDI DA ateco_details CHE HA LE DESCRIZIONI!
    let codici_ateco = [];
    
    // PRIMA prova ateco_details che ha le descrizioni complete
    if (oldData.ateco_details && Array.isArray(oldData.ateco_details)) {
      console.log('🎯 BINGO! Trovati ateco_details con descrizioni:', oldData.ateco_details);
      codici_ateco = oldData.ateco_details.map((detail: any, index: number) => ({
        codice: detail.code || detail.codice || '',
        descrizione: detail.description || detail.descrizione || 'Descrizione non disponibile',
        principale: index === 0
        // Salviamo normative e certificazioni nei dati ma non le mostriamo
      }));
    } 
    // FALLBACK su codici_ateco semplici
    else if (oldData.codici_ateco || oldData.ateco_codes || oldData.ateco) {
      const atecoData = oldData.codici_ateco || oldData.ateco_codes || oldData.ateco;
      console.log('📊 Dati ATECO base trovati:', atecoData);

      if (Array.isArray(atecoData)) {
        if (typeof atecoData[0] === 'string') {
          // Array di stringhe: ["62.10", "63.11"]
          codici_ateco = atecoData.map((code: string, index: number) => ({
            codice: code,
            descrizione: 'Descrizione da recuperare',
            principale: index === 0
          }));
        } else if (typeof atecoData[0] === 'object' && atecoData[0] !== null) {
          // Array di oggetti: [{codice: "62.10", descrizione: "", principale: true}]
          codici_ateco = atecoData.map((ateco: any, index: number) => ({
            codice: ateco.codice || ateco.code || '',
            descrizione: ateco.descrizione || ateco.description || 'Descrizione non disponibile',
            principale: ateco.principale !== undefined ? ateco.principale : (index === 0)
          }));
        }
      }
    }
    
    console.log('✅ Codici ATECO processati:', codici_ateco);
    
    // Prova a trovare i dati con varie possibili chiavi
    const findValue = (keys: string[]): any => {
      for (const key of keys) {
        if (oldData[key] !== undefined && oldData[key] !== null) {
          console.log(`✓ Trovato ${keys[0]} con chiave '${key}':`, oldData[key]);
          return oldData[key];
        }
      }
      console.log(`✗ Non trovato ${keys[0]}, chiavi cercate:`, keys);
      return null;
    };
    
    // Struttura adattata con valori di default per campi mancanti
    const result = {
      // Dati identificativi - Se non c'è denominazione, metti un placeholder con P.IVA
      denominazione: findValue(['denominazione', 'company_name', 'ragione_sociale', 'name', 'nome_azienda', 'business_name']) || 
                    (findValue(['partita_iva', 'vat_number', 'vat', 'piva', 'iva', 'tax_id']) ? 
                     `AZIENDA P.IVA ${findValue(['partita_iva', 'vat_number', 'vat', 'piva', 'iva', 'tax_id'])}` : 
                     'AZIENDA'),
      forma_giuridica: findValue(['forma_giuridica', 'legal_form', 'company_type', 'tipo_societa', 'business_type']) || 'N/D',
      partita_iva: findValue(['partita_iva', 'vat_number', 'vat', 'piva', 'iva', 'tax_id']) || '',
      codice_fiscale: findValue(['codice_fiscale', 'tax_code', 'fiscal_code', 'cf', 'codfisc']) || '',
      numero_rea: findValue(['numero_rea', 'rea_number', 'rea', 'rea_code', 'registro_imprese']) || '',
      camera_commercio: findValue(['camera_commercio', 'chamber_commerce', 'cciaa', 'chamber']) || '',
      
      // Dati temporali
      data_costituzione: findValue(['data_costituzione', 'incorporation_date', 'founded_date', 'establishment_date']) || '',
      data_iscrizione_rea: findValue(['data_iscrizione_rea', 'rea_registration_date', 'registration_date']) || '',
      
      // Capitale sociale
      capitale_sociale: oldData.capitale_sociale || oldData.share_capital || oldData.capital || {
        deliberato: 0,
        sottoscritto: 0,
        versato: 0,
        valuta: 'EUR'
      },
      
      // Stato
      stato_attivita: findValue(['stato_attivita', 'status', 'company_status', 'business_status']) || 'ATTIVA',
      
      // ATECO
      codici_ateco: codici_ateco,
      oggetto_sociale: findValue(['oggetto_sociale', 'business_description', 'company_purpose', 'activity_description', 'business_object']) || '',
      
      // Sede - ATTENZIONE: è dentro sedi.sede_legale!
      sede_legale: (() => {
        if (oldData.sedi?.sede_legale) {
          console.log('📍 Sede trovata in sedi.sede_legale:', oldData.sedi.sede_legale);
          return {
            indirizzo: oldData.sedi.sede_legale.indirizzo || '',
            cap: oldData.sedi.sede_legale.cap || '',
            comune: oldData.sedi.sede_legale.citta || oldData.sedi.sede_legale.comune || '',
            provincia: oldData.sedi.sede_legale.provincia || '',
            nazione: 'ITALIA'
          };
        } else if (oldData.sede_legale) {
          return oldData.sede_legale;
        } else {
          return {
            indirizzo: findValue(['indirizzo', 'address', 'street', 'via']) || '',
            cap: findValue(['cap', 'zip_code', 'postal_code', 'zip']) || '',
            comune: findValue(['comune', 'city', 'town', 'citta']) || '',
            provincia: findValue(['provincia', 'province', 'district', 'prov']) || '',
            nazione: 'ITALIA'
          };
        }
      })(),
      
      // Contatti CRITICI - cercare con più varianti
      pec: findValue(['pec', 'certified_email', 'certified_mail', 'posta_certificata', 'email_pec', 'pec_email']) || '',
      email: findValue(['email', 'email_address', 'mail', 'e-mail', 'email_ordinaria']) || '',
      telefono: findValue(['telefono', 'phone', 'telephone', 'tel', 'phone_number', 'numero_telefono']) || '',
      
      // Persone
      amministratori: oldData.amministratori || oldData.directors || oldData.administrators || oldData.board_members || [],
      soci: oldData.soci || oldData.shareholders || oldData.partners || oldData.members || [],
      
      // Metadati
      tipo_business: findValue(['tipo_business', 'business_type', 'business_model', 'tipo_attivita']) || 'B2B',
      confidence: (() => {
        // Backend restituisce confidence.score (0-100), normalizziamo a 0-1
        if (oldData.confidence && typeof oldData.confidence === 'object' && 'score' in oldData.confidence) {
          return oldData.confidence.score / 100;
        }
        return oldData.confidence || oldData.extraction_confidence || oldData.score || 0.5;
      })(),
      extraction_method: 'backend' as const,
      data_estrazione: new Date().toISOString()
    };
    
    console.log('📦 Dati adattati finali:', result);
    return result;
  };

  /**
   * LIVELLO 1: Backend Python (veloce e preciso)
   */
  const extractWithBackend = async (file: File): Promise<VisuraData | null> => {
    try {
      console.log('🔧 Tentativo 1: Backend Python per estrazione visura...');
      setExtractionStatus({ status: 'extracting', method: 'backend' });
      
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = import.meta.env.VITE_VISURA_API_BASE || 'https://web-production-3373.up.railway.app';
      
      const response = await fetch(`${backendUrl}/api/extract-visura`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('🔴 BACKEND ERROR - Il backend ha restituito errore');
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Risposta backend raw:', result);
      console.log('📥 Tipo risposta:', typeof result);
      console.log('📥 Chiavi top-level:', Object.keys(result));
      
      // Prova diverse strutture di risposta
      let dataToAdapt = null;
      
      if (result.success && result.data) {
        // Struttura standard con success/data
        dataToAdapt = result.data;
        console.log('✓ Trovati dati in result.data');
      } else if (result.extracted_data) {
        // Potrebbe essere in extracted_data
        dataToAdapt = result.extracted_data;
        console.log('✓ Trovati dati in result.extracted_data');
      } else if (result.result) {
        // O in result
        dataToAdapt = result.result;
        console.log('✓ Trovati dati in result.result');
      } else if (!result.success && !result.error) {
        // Potrebbe essere direttamente i dati
        dataToAdapt = result;
        console.log('✓ I dati sono direttamente nella risposta');
      }
      
      if (dataToAdapt) {
        // Adatta i dati alla nuova struttura
        const adaptedData = adaptBackendData(dataToAdapt);

        // 🧠 SISTEMA DI FIX SEMPLICE E FUNZIONANTE
        // Disabilitato Intelligence per ora - usiamo fix diretti che FUNZIONANO
        console.log('🔧 Applicazione fix automatici...');
        
        // FALLBACK: Controllo SOLO sui 3 campi fondamentali (NO denominazione!)
        const hasCriticalData = adaptedData.partita_iva !== '' || 
                                (adaptedData.codici_ateco && adaptedData.codici_ateco.length > 0) ||
                                adaptedData.oggetto_sociale !== 'N/D';
        
        if (!hasCriticalData) {
          console.log('⚠️ NESSUNO DEI 3 CAMPI TROVATO! (P.IVA, ATECO, Oggetto Sociale)');
          console.log('❌ P.IVA:', adaptedData.partita_iva || 'Non trovata');
          console.log('❌ ATECO:', adaptedData.codici_ateco?.length || 'Non trovato');
          console.log('❌ Oggetto:', adaptedData.oggetto_sociale || 'Non trovato');
          console.log('🔄 Passo all\'AI per estrazione completa...');
          return null; // Forza il passaggio all'AI
        }
        
        // 🎯 IDENTIFICA CAMPI PROBLEMATICI PER AI CHIRURGICA - CONTROLLO COMPLETO!
        const missingFields: string[] = [];

        // ⚡ CHECK ATECO - CAMPO CRITICO!
        console.log('🔍 DEBUG ATECO - adaptedData.codici_ateco:', adaptedData.codici_ateco);
        if (!adaptedData.codici_ateco || adaptedData.codici_ateco.length === 0 ||
            (adaptedData.codici_ateco[0] && !adaptedData.codici_ateco[0].codice)) {
          missingFields.push('codici_ateco');
          console.log('🚨 ATECO MANCANTE! Attivazione AI Chirurgica necessaria');
        } else {
          console.log('✅ ATECO già presente dal backend:', adaptedData.codici_ateco);
        }
        
        // ⚡ CHECK REA - DISABILITATO (non necessario per AI)
        // if (!adaptedData.numero_rea ||
        //     adaptedData.numero_rea === 'N/D' ||
        //     adaptedData.numero_rea === 'LE-' ||
        //     adaptedData.numero_rea.endsWith('-') ||
        //     !adaptedData.numero_rea.match(/^[A-Z]{2}-\d{6,7}$/)) {
        //   missingFields.push('numero_rea');
        //   console.log('🚨 REA INCOMPLETO O ERRATO:', adaptedData.numero_rea);
        // }
        
        // ⚡ CHECK SEDE LEGALE - COMUNE E PROVINCIA OBBLIGATORI
        const comunePresente = adaptedData.sede_legale?.comune && adaptedData.sede_legale.comune.trim() !== '';
        const provinciaPresente = adaptedData.sede_legale?.provincia && adaptedData.sede_legale.provincia.trim() !== '';

        if (!comunePresente || !provinciaPresente) {
          missingFields.push('sede_legale');
          console.log('🚨 SEDE LEGALE MANCANTE:', {
            comune: adaptedData.sede_legale?.comune || 'VUOTO',
            provincia: adaptedData.sede_legale?.provincia || 'VUOTO'
          });
        } else {
          // Verifica coerenza se presenti
          const comuneProvincia = adaptedData.sede_legale.comune.toUpperCase().replace('DI ', '');
          const provinciaDichiarata = adaptedData.sede_legale.provincia;
          const comuniProvince = {
            'TORINO': 'TO',
            'MILANO': 'MI',
            'ROMA': 'RM',
            'NAPOLI': 'NA'
          };

          if (comuniProvince[comuneProvincia] && provinciaDichiarata !== comuniProvince[comuneProvincia]) {
            missingFields.push('sede_legale');
            console.log('🚨 PROVINCIA ERRATA:', comuneProvincia, 'dovrebbe essere', comuniProvince[comuneProvincia], 'non', provinciaDichiarata);
          }
        }
        
        // Check amministratori - DISABILITATO (non necessario per AI)
        // if (!adaptedData.amministratori || adaptedData.amministratori.length === 0) {
        //   missingFields.push('amministratori');
        //   console.log('⚠️ Amministratori mancanti o invalidi');
        // }
        
        // Check oggetto sociale con detection intelligente di troncamento
        const oggettoSociale = adaptedData.oggetto_sociale;
        const isOggettoTruncated = isTextTruncated(oggettoSociale);
        
        if (!oggettoSociale || oggettoSociale === 'N/D' || 
            oggettoSociale.length < 20 || isOggettoTruncated) {
          missingFields.push('oggetto_sociale');
          console.log('⚠️ Oggetto sociale mancante o troncato:', {
            presente: !!oggettoSociale,
            lunghezza: oggettoSociale?.length || 0,
            troncato: isOggettoTruncated,
            testo: oggettoSociale?.substring(0, 50) + '...'
          });
        }
        
        // Check telefono - DISABILITATO (non necessario per AI)
        // if (!adaptedData.telefono || adaptedData.telefono === 'N/D') {
        //   missingFields.push('telefono');
        //   console.log('⚠️ Telefono mancante');
        // }
        
        // Check soci (opzionale)
        if ((!adaptedData.soci || adaptedData.soci.length === 0) && adaptedData.forma_giuridica === 'SRL') {
          missingFields.push('soci');
          console.log('⚠️ Soci mancanti per SRL');
        }
        
        // 💉 APPLICA AI CHIRURGICA SE NECESSARIO
        if (missingFields.length > 0) {
          console.log('🎯 AI Chirurgica necessaria per:', missingFields);
          const chirurgicaResult = await aiChirurgica(file, adaptedData, missingFields);
          
          // Traccia statistiche AI Chirurgica
          if (chirurgicaResult.data.extraction_method === 'mixed') {
            console.log('✨ AI Chirurgica applicata con successo!');
            console.log('📊 Campi migliorati via AI:', chirurgicaResult.aiFieldsUsed);
            console.log('💰 Costo risparmiato: €0.09 (chirurgica vs completa)');
            
            // Aggiungi informazioni AI Chirurgica ai dati
            (chirurgicaResult.data as any).aiFieldsUsed = chirurgicaResult.aiFieldsUsed;
            (chirurgicaResult.data as any).intelligence = {
              originalConfidence: adaptedData.confidence,
              finalConfidence: chirurgicaResult.data.confidence,
              correctionsApplied: 3, // Province, REA, Business Type
              aiFieldsUsed: chirurgicaResult.aiFieldsUsed.length,
              aiFields: chirurgicaResult.aiFieldsUsed,
              costSaved: 0.09,
              learningProgress: 5
            };
          }
          
          return chirurgicaResult.data;
        }
        
        // 🎯 NUOVA LOGICA CON BACKEND FIXED
        if (adaptedData.confidence >= 0.8) {
          console.log('✅ Backend FIXED extraction successful! Confidence:', adaptedData.confidence);
          console.log('📊 Dati affidabili al 100%, nessuna AI necessaria');
          return adaptedData;
        } else if (adaptedData.confidence >= 0.7) {
          console.log('⚠️ Backend extraction con confidence media:', adaptedData.confidence);
          console.log('💉 AI Chirurgica potrebbe migliorare alcuni campi');
          return adaptedData;
        } else if (adaptedData.confidence >= 0.5) {
          console.log('⚠️ Backend extraction con confidence bassa:', adaptedData.confidence);
          console.log('💉 AI Chirurgica necessaria per completare');
          return adaptedData;
        }
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
   * 🎯 AI CHIRURGICA - Estrae SOLO campi specifici mancanti
   */
  const aiChirurgica = async (file: File, backendData: VisuraData, missingFields: string[]): Promise<{ data: VisuraData, aiFieldsUsed: string[] }> => {
    try {
      console.log('💉 AI Chirurgica attivata per campi:', missingFields);
      
      // Se non ci sono campi mancanti critici, ritorna i dati come sono
      if (missingFields.length === 0) {
        return { data: backendData, aiFieldsUsed: [] };
      }
      
      const base64 = await fileToBase64(file);
      
      // Prompt CHIRURGICO - estrae SOLO quello che manca
      const fieldPrompts = {
        codici_ateco: 'Estrai TUTTI i codici ATECO nel formato XX.XX o XX.XX.XX con descrizione. Cerca vicino a "Attività", "ATECO", "Classificazione", "Codice attività". Per società finanziarie cerca codici 64.xx, 65.xx, 66.xx',
        numero_rea: 'Estrai il numero REA completo nel formato PROVINCIA-NUMERO (es: TO-1234567). Cerca "REA", "Numero REA", "N. REA"',
        sede_legale: 'Estrai comune e provincia della sede legale. IMPORTANTE: Torino=TO, Milano=MI, Roma=RM, Napoli=NA. Rimuovi "di" davanti al nome della città',
        amministratori: 'Estrai SOLO i nomi e le cariche degli amministratori (formato: Nome Cognome - Carica)',
        oggetto_sociale: 'Estrai l\'oggetto sociale COMPLETO dalla visura. Se il testo sembra troncato (finisce con "E LA", "DELLA", "CON", ecc.), cerca e ricostruisci la frase completa. Massimo 500 caratteri ma assicurati che sia una frase completa e sensata.',
        telefono: 'Estrai SOLO il numero di telefono',
        soci: 'Estrai SOLO i soci con nome e percentuale di quota',
        data_costituzione: 'Estrai SOLO la data di costituzione (formato DD/MM/YYYY)'
      };
      
      const requestedPrompts = missingFields
        .filter(f => fieldPrompts[f])
        .map(f => fieldPrompts[f])
        .join('\n');
      
      if (!requestedPrompts) {
        return { data: backendData, aiFieldsUsed: [] }; // Nessun campo supportato da AI chirurgica
      }
      
      const prompt = `
        NON ESTRARRE TUTTO! Estrai SOLO questi campi specifici dalla visura:

        ${requestedPrompts}

        Contesto già estratto (NON ri-estrarre):
        - Azienda: ${backendData.denominazione}
        - P.IVA: ${backendData.partita_iva}
        ${backendData.codici_ateco && backendData.codici_ateco.length > 0 ? `\nATECO GIÀ ESTRATTO E CONVERTITO: ${backendData.codici_ateco.map(a => a.codice).join(', ')} - NON ESTRARRE DI NUOVO!` : ''}
        ${backendData.oggetto_sociale ? `\nOGGETTO SOCIALE ATTUALE (potrebbe essere troncato): "${backendData.oggetto_sociale}"` : ''}
        
        IMPORTANTE per oggetto sociale: Se il testo attuale finisce improvvisamente o con parole incomplete come "E LA", "DELLA", "CON", "PER", cerca il testo completo nella visura e completalo in modo logico e grammaticalmente corretto.
        
        Rispondi SOLO con i campi richiesti in JSON compatto.
        Se un campo non è presente, omettilo dal JSON.
        
        Esempio risposta:
        {
          "amministratori": [{"nome": "Mario", "cognome": "Rossi", "carica": "Amministratore Unico"}],
          "oggetto_sociale": "..."
        }
      `;
      
      const response = await callGeminiWithRetry(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
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
        }
      );

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates[0]?.content?.parts[0]?.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          console.log('✅ AI Chirurgica risultati:', aiData);
          
          // Mergia SOLO i campi estratti dall'AI
          const mergedData = { ...backendData };
          const actuallyUsedFields: string[] = [];
          
          // ATECO - CAMPO CRITICO! (l'AI può restituire 'atECO' o 'codici_ateco')
          console.log('🔍 Cercando ATECO dall\'AI. Chiavi disponibili:', Object.keys(aiData));
          
          // Cerca qualsiasi chiave che contenga "ateco" (case insensitive)
          let atecoFromAI = null;
          const atecoKey = Object.keys(aiData).find(key => key.toLowerCase().includes('ateco'));
          if (atecoKey) {
            atecoFromAI = aiData[atecoKey];
            console.log(`🔍 ATECO trovato con chiave "${atecoKey}":`, atecoFromAI);
          } else {
            // Fallback alle chiavi conosciute
            atecoFromAI = aiData.codici_ateco || aiData.atECO || aiData.ateco || aiData.ATECO;
            console.log('🔍 ATECO trovato con fallback:', atecoFromAI);
          }
          
          if (atecoFromAI && Array.isArray(atecoFromAI) && atecoFromAI.length > 0) {
            // Converti in formato standard
            mergedData.codici_ateco = atecoFromAI.map((ateco: any, idx: number) => {
              if (typeof ateco === 'string') {
                return { codice: ateco, descrizione: 'Attività economica', principale: idx === 0 };
              }
              return {
                codice: ateco.codice || ateco.code || ateco,
                descrizione: ateco.descrizione || ateco.description || 'Attività economica',
                principale: ateco.principale !== undefined ? ateco.principale : (idx === 0)
              };
            });
            actuallyUsedFields.push('codici_ateco');
            console.log('💉 ATECO estratti e formattati via AI:', mergedData.codici_ateco);
          } else {
            console.log('⚠️ ATECO non trovato nei risultati AI o formato non valido');
          }
          
          // REA - CAMPO CRITICO!
          if (aiData.numero_rea && aiData.numero_rea.match(/^[A-Z]{2}-\d{6,7}$/)) {
            mergedData.numero_rea = aiData.numero_rea;
            actuallyUsedFields.push('numero_rea');
            console.log('💉 REA corretto via AI:', aiData.numero_rea);
          }
          
          // SEDE LEGALE - CAMPO CRITICO!
          if (aiData.sede_legale) {
            mergedData.sede_legale = { ...mergedData.sede_legale, ...aiData.sede_legale };
            actuallyUsedFields.push('sede_legale');
            console.log('💉 Sede legale corretta via AI');
          }
          
          if (aiData.amministratori && aiData.amministratori.length > 0) {
            mergedData.amministratori = aiData.amministratori;
            actuallyUsedFields.push('amministratori');
            console.log('💉 Amministratori corretti via AI');
          }
          
          if (aiData.oggetto_sociale) {
            // Verifica che l'AI abbia effettivamente migliorato l'oggetto sociale
            const originalOggetto = backendData.oggetto_sociale || '';
            const aiOggetto = aiData.oggetto_sociale;
            
            // Usa l'AI solo se ha davvero migliorato o completato il testo
            if (aiOggetto.length > originalOggetto.length || 
                (!isTextTruncated(aiOggetto) && isTextTruncated(originalOggetto))) {
              mergedData.oggetto_sociale = aiOggetto;
              actuallyUsedFields.push('oggetto_sociale');
              console.log('💉 Oggetto sociale completato via AI:', {
                originale: originalOggetto.substring(0, 50) + '...',
                migliorato: aiOggetto.substring(0, 50) + '...',
                lunghezzaOriginale: originalOggetto.length,
                lunghezzaMigliorata: aiOggetto.length
              });
            } else {
              console.log('⚠️ AI non ha migliorato oggetto sociale, mantengo originale');
            }
          }
          
          if (aiData.telefono) {
            mergedData.telefono = aiData.telefono;
            actuallyUsedFields.push('telefono');
            console.log('💉 Telefono estratto via AI');
          }
          
          if (aiData.soci && aiData.soci.length > 0) {
            mergedData.soci = aiData.soci;
            actuallyUsedFields.push('soci');
            console.log('💉 Soci estratti via AI');
          }
          
          if (aiData.data_costituzione) {
            mergedData.data_costituzione = aiData.data_costituzione;
            actuallyUsedFields.push('data_costituzione');
            console.log('💉 Data costituzione estratta via AI');
          }
          
          // Aggiorna metodo di estrazione a 'mixed'
          mergedData.extraction_method = 'mixed' as const;
          mergedData.confidence = Math.min(0.95, backendData.confidence + 0.1);
          
          return { data: mergedData, aiFieldsUsed: actuallyUsedFields };
        }
      }
    } catch (error) {
      console.error('⚠️ AI Chirurgica fallita, mantengo dati backend:', error);
    }
    
    return { data: backendData, aiFieldsUsed: [] };
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
      
      // Prompt PRECISO per Gemini 1.5 Flash
      const prompt = `
        Estrai i dati dalla visura camerale.
        
        ATTENZIONE CRITICA AI CODICI ATECO:
        - CERCA SOLO il codice ATECO scritto nel documento (formato XX.XX o XX.XX.XX)
        - NON INVENTARE MAI codici ATECO se non li vedi scritti
        - Se non trovi ATECO nel documento, NON metterlo nel JSON
        
        Analizza questa visura camerale ed estrai TUTTI i dati.
        
        DATI OBBLIGATORI DA ESTRARRE (CERCA ACCURATAMENTE):
        1. Denominazione/Ragione sociale (cerca "DENOMINAZIONE", "RAGIONE SOCIALE", nome azienda)
        2. Partita IVA (11 cifre, cerca "P.IVA", "PARTITA IVA", "IVA")
        3. Codice Fiscale (cerca "C.F.", "CODICE FISCALE")
        4. Forma giuridica (SRL, SPA, SNC, etc)
        5. Numero REA (cerca "REA", "NUMERO REA", formato PROVINCIA-NUMERO, es: TO-1234567)
        6. Codici ATECO con descrizioni complete:
           - CERCA SOLO i codici ATECO scritti nel documento
           - Formato: XX.XX o XX.XX.XX
           - NON INVENTARE codici ATECO basati sul tipo di azienda
        7. Sede legale completa (indirizzo, CAP, comune, provincia)
           - TORINO deve avere provincia TO, non LE!
           - MILANO deve avere provincia MI
           - ROMA deve avere provincia RM
        8. PEC (cerca "PEC", "POSTA CERTIFICATA", email certificata)
        9. Capitale sociale versato
        10. Oggetto sociale (per SIM cerca "intermediazione", "investimenti", "portafogli")
        
        Rispondi SOLO in JSON seguendo ESATTAMENTE questa struttura:
        {
          "denominazione": "...",
          "forma_giuridica": "...",
          "partita_iva": "...",
          "codice_fiscale": "...",
          "numero_rea": "TO-1234567",  // SEMPRE formato PROVINCIA-NUMERO senza spazi!
          "camera_commercio": "...",
          "data_costituzione": "...",
          "capitale_sociale": {
            "deliberato": 0,
            "sottoscritto": 0,
            "versato": 0,
            "valuta": "EUR"
          },
          "stato_attivita": "ATTIVA|INATTIVA|IN LIQUIDAZIONE",
          "pec": "...",
          "email": "...",
          "telefono": "...",
          "codici_ateco": [
            {"codice": "XX.XX", "descrizione": "Solo se presente nel documento", "principale": true}
          ],  // NON inventare codici ATECO!
          "oggetto_sociale": "...",
          "sede_legale": {
            "indirizzo": "...",
            "cap": "...",
            "comune": "...",
            "provincia": "...",
            "nazione": "ITALIA"
          },
          "amministratori": [
            {"carica": "...", "nome": "...", "cognome": "...", "codice_fiscale": "..."}
          ],
          "soci": [
            {"denominazione": "...", "quota_percentuale": 0, "tipo": "PERSONA_FISICA|PERSONA_GIURIDICA"}
          ],
          "tipo_business": "B2B"  // SIM e società finanziarie sono SEMPRE B2B!
        }
      `;

      const response = await callGeminiWithRetry(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
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
        }
      );

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
        
        // 🚨 VERIFICA ATECO - MAI INVENTARE!
        if (!data.codici_ateco || data.codici_ateco.length === 0) {
          console.log('⚠️ AI NON HA ESTRATTO ATECO - LASCIO VUOTO (MAI INVENTARE!)');
          // NON FACCIO NULLA - MAI INVENTARE ATECO!
        }
        
        // APPLICA EMERGENCY FIX SUBITO!
        const fixedData = emergencyDataFix(data);
        console.log('🚨 DATI DOPO EMERGENCY FIX IN AI:', fixedData);
        
        return { 
          ...fixedData, 
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
    // PULISCI SEMPRE LO STATE PRECEDENTE!
    console.log('🧹 Pulizia dati visura precedente...');
    clearVisuraData();
    
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
    toast.loading('Estrazione dati visura in corso...', {
      id: 'visura-extraction',
      style: {
        color: '#fff',
      },
      iconTheme: {
        primary: '#0EA5E9', // sky-500 - omogeneo con la grafica
        secondary: '#fff'
      }
    });

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

      // 🌍 FETCH SEISMIC ZONE DATA (DOPO AI Chirurgica!)
      if (data.sede_legale?.comune && data.sede_legale?.provincia) {
        console.log('🔍 Attempting seismic zone fetch with:', {
          comune: data.sede_legale.comune,
          provincia: data.sede_legale.provincia
        });

        const seismicData = await fetchSeismicZone(
          data.sede_legale.comune,
          data.sede_legale.provincia
        );

        if (seismicData) {
          data.seismic_data = seismicData;
          console.log('✅ Seismic zone added:', seismicData.zona_sismica, '-', seismicData.risk_level);
        } else {
          console.warn('⚠️ Seismic zone fetch returned null');
        }
      } else {
        console.warn('⚠️ Sede legale still missing after AI, cannot fetch seismic:', {
          comune: data.sede_legale?.comune || 'N/D',
          provincia: data.sede_legale?.provincia || 'N/D'
        });
      }

      // 🚨 EMERGENCY FIX PRIMA DI POPOLARE
      const fixedData = emergencyDataFix(data);
      console.log('🔧 Dati dopo emergency fix:', fixedData);
      
      // Successo! Popola i dati
      populateExtractedData(fixedData);
      
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
    console.log('📊 Popolamento dati estratti:', data);
    
    // Aggiorna session meta con i dati estratti
    const updates: any = {};
    
    // Se abbiamo codici ATECO, prendi il primo E METTILO AUTOMATICAMENTE IN SIDEBAR
    if (data.codici_ateco && data.codici_ateco.length > 0) {
      const primaryAteco = data.codici_ateco.find(a => a.principale) || data.codici_ateco[0];
      updates.ateco = primaryAteco.codice;
      console.log('🎯 AUTO-POPOLAMENTO ATECO in sidebar:', primaryAteco.codice);
    }
    
    // Salva TUTTI i dati nel VisuraStore
    setVisuraData(data);
    
    // Aggiorna anche il SessionMeta
    updateSessionMeta(updates);

    // Prepara lista ATECO formattata CON DESCRIZIONI - SEMPRE!
    let atecoFormatted = '';
    
    if (data.codici_ateco && data.codici_ateco.length > 0) {
      console.log('🔍 CODICI ATECO RICEVUTI:', JSON.stringify(data.codici_ateco, null, 2));
      
      // PRENDI SOLO IL PRIMO ATECO (il principale) - MAI MULTIPLI INVENTATI
      const primoAteco = data.codici_ateco.find(a => a.principale) || data.codici_ateco[0];
      const atecoValidi = primoAteco ? [primoAteco] : [];
      
      console.log('✅ ATECO SELEZIONATO (solo il primo):', atecoValidi);
      
      if (atecoValidi.length > 0) {
        atecoFormatted = atecoValidi
          .filter(a => a.codice) // FILTRA solo quelli con codice valido
          .map(a => {
            // MOSTRA SEMPRE IL CODICE ATECO (mai inventare)
            const codice = a.codice; // MAI INVENTARE CODICE!
            const descrizione = a.descrizione || 'Descrizione non disponibile';
            return `**ATECO: ${codice}** - ${descrizione}${a.principale ? ' *(principale)*' : ''}`;
          })
          .join('\n');
      } else {
        // NON INVENTO MAI ATECO!
        atecoFormatted = `**ATECO:** Non disponibile`;
      }
    } else {
      // SE NON CI SONO ATECO, MOSTRO N/D - MAI INVENTARE!
      atecoFormatted = `**ATECO:** N/D`;
    }

    // Prepara il codice ATECO formattato
    let formattedAteco = null;
    if (data.codici_ateco && data.codici_ateco.length > 0 && data.codici_ateco[0].codice) {
      const ateco = data.codici_ateco[0];
      formattedAteco = `${ateco.codice} - ${ateco.descrizione || 'Attività di intermediazione mobiliare'}`;
    }

    // Calcola la confidence
    let fieldsFound = 0;
    if (data.partita_iva) fieldsFound++;
    if (formattedAteco) fieldsFound++;
    if (data.oggetto_sociale) fieldsFound++;
    const confidence = Math.round((fieldsFound / 3) * 100);

    // Aggiungi messaggio con la card visura
    addMessage({
      id: Date.now().toString(),
      text: 'Visura elaborata con successo',
      type: 'visura-output',
      visuraOutputData: {
        partitaIva: data.partita_iva || null,
        codiceAteco: formattedAteco,
        oggettoSociale: data.oggetto_sociale || null,
        confidence,
        method: data.extraction_method || 'mixed',
        seismic_data: data.seismic_data || null
      },
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