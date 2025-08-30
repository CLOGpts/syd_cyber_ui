// Tipizzazione completa per dati estratti da Visura Camerale

export interface VisuraData {
  // === DATI IDENTIFICATIVI AZIENDA ===
  denominazione: string;              // Ragione sociale completa
  forma_giuridica: string;            // SRL, SPA, SNC, etc.
  partita_iva: string;                // 11 cifre
  codice_fiscale: string;             // Può coincidere con P.IVA
  numero_rea: string;                 // ES: RM-1234567
  camera_commercio: string;           // ES: Roma
  
  // === DATI TEMPORALI ===
  data_costituzione: string;          // DD/MM/YYYY
  data_iscrizione_rea: string;        // DD/MM/YYYY
  data_ultimo_bilancio?: string;      // DD/MM/YYYY
  durata_societa?: string;            // ES: 31/12/2050
  
  // === DATI ECONOMICI ===
  capitale_sociale: {
    deliberato: number;                // in euro
    sottoscritto: number;              // in euro
    versato: number;                   // in euro
    valuta: string;                    // EUR
  };
  stato_attivita: 'ATTIVA' | 'INATTIVA' | 'IN LIQUIDAZIONE' | 'CESSATA' | 'SOSPESA';
  stato_liquidazione?: string;        // Se in liquidazione
  
  // === ATTIVITÀ ===
  codici_ateco: Array<{
    codice: string;                    // ES: 62.01.00
    descrizione: string;               // Produzione di software
    principale: boolean;               // true se attività principale
    data_inizio?: string;              // DD/MM/YYYY
  }>;
  oggetto_sociale: string;            // Descrizione completa attività
  
  // === SEDI ===
  sede_legale: {
    indirizzo: string;
    cap: string;
    comune: string;
    provincia: string;
    nazione: string;
    presso?: string;                   // ES: "presso Studio Rossi"
  };
  unita_locali?: Array<{
    tipo: string;                      // ES: "Unità locale", "Sede secondaria"
    indirizzo: string;
    cap: string;
    comune: string;
    provincia: string;
    stato: 'ATTIVA' | 'CESSATA';
    data_apertura?: string;
    attivita?: string;                 // Descrizione attività svolta
  }>;
  
  // === CONTATTI ===
  pec: string;                         // FONDAMENTALE per comunicazioni ufficiali
  email?: string;
  telefono?: string;
  fax?: string;
  sito_web?: string;
  
  // === PERSONE ===
  amministratori?: Array<{
    carica: string;                    // ES: "Amministratore Unico", "Presidente CdA"
    nome: string;
    cognome: string;
    codice_fiscale: string;
    data_nascita?: string;
    luogo_nascita?: string;
    data_nomina?: string;
    durata_carica?: string;            // ES: "fino revoca", "3 anni"
    poteri?: string;                   // Descrizione poteri
  }>;
  
  soci?: Array<{
    tipo: 'PERSONA_FISICA' | 'PERSONA_GIURIDICA';
    denominazione: string;              // Nome o ragione sociale
    codice_fiscale?: string;
    partita_iva?: string;
    quota_percentuale?: number;        // ES: 51.00
    quota_euro?: number;               // ES: 5100.00
    tipo_diritto?: string;             // ES: "PROPRIETA'"
  }>;
  
  sindaci?: Array<{
    carica: string;                    // ES: "Sindaco effettivo", "Sindaco supplente"
    nome: string;
    cognome: string;
    codice_fiscale: string;
    data_nomina?: string;
  }>;
  
  // === ALTRI DATI ===
  dipendenti?: {
    numero_dipendenti?: number;
    data_riferimento?: string;
    fonte?: string;                    // ES: "INPS", "Dichiarazione"
  };
  
  fatturato?: {
    ultimo_anno?: number;              // in euro
    anno_riferimento?: string;
    trend?: 'CRESCITA' | 'STABILE' | 'DECRESCITA';
  };
  
  certificazioni?: Array<{
    tipo: string;                      // ES: "ISO 9001", "ISO 27001"
    ente_certificatore?: string;
    data_rilascio?: string;
    data_scadenza?: string;
  }>;
  
  procedure_concorsuali?: Array<{
    tipo: string;                      // ES: "Fallimento", "Concordato"
    data?: string;
    tribunale?: string;
    stato?: string;
  }>;
  
  // === METADATI ESTRAZIONE ===
  tipo_business: 'B2B' | 'B2C' | 'B2B/B2C' | 'B2G';  // Inferito
  confidence: number;                  // 0-1 confidenza estrazione
  extraction_method: 'backend' | 'ai' | 'chat' | 'regex' | 'mixed';
  data_estrazione: string;            // Timestamp estrazione
  versione_visura?: string;           // Data della visura stessa
  numero_pagine?: number;
}

// Tipo per risposta API backend
export interface VisuraExtractionResponse {
  success: boolean;
  data?: VisuraData;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  processing_time_ms?: number;
}

// Tipo per stato UI
export interface VisuraUIState {
  isExtracting: boolean;
  extractedData: VisuraData | null;
  error: string | null;
  lastExtractionTime: string | null;
  confidence: number;
}