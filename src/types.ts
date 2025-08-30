export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  type?: 'text' | 'ateco-response';
  atecoData?: any; // Dati strutturati per risposta ATECO
}

export interface UploadFile {
  id: string;
  file: File;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface SessionMeta {
  ateco: string;
  address: string;
  criticalAssets: string;

  // Nuovi campi per arricchimento ATECO
  settore?: string;
  normative?: string;        // elenco normative (unito come stringa)
  certificazioni?: string;   // elenco certificazioni (unito come stringa)
  
  // Campi aggiunti per visura camerale
  allAtecoCodes?: string[];
  businessMission?: string;
  sede_legale?: any;
  unita_locali?: any[];
  businessType?: 'B2B' | 'B2C' | 'B2B/B2C';
  extractionMethod?: 'backend' | 'ai' | 'chat';
  extractionConfidence?: number;
}
