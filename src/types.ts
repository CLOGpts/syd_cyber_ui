export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  type?: 'text' | 'ateco-response' | 'risk-management' | 'risk-categories' | 'risk-events' | 'risk-description' | 'assessment-question' | 'visura-output' | 'assessment-complete' | 'control-description';
  atecoData?: any; // Dati strutturati per risposta ATECO
  riskData?: any; // Dati strutturati per Risk Management
  visuraOutputData?: {
    partitaIva?: string | null;
    codiceAteco?: string | null;
    oggettoSociale?: string | null;
    confidence?: number;
    method?: string;
  }; // Dati strutturati per output visura
  riskEventsData?: {
    events: any[];
    categoryName: string;
    categoryGradient: string;
  };
  riskDescriptionData?: {
    eventCode: string;
    eventName: string;
    category: string;
    severity: string;
    description: string;
    probability?: string;
    impact?: string;
    controls?: string;
    monitoring?: string;
  };
  assessmentQuestionData?: {
    questionNumber: number;
    totalQuestions: number;
    question: string;
    options: string[];
    fieldName: string;
  };
  assessmentCompleteData?: {
    riskScore: number;
    riskLevel: string;
    analysis: string;
  };
  controlDescriptionData?: {
    controlTitle?: string;
    controlDescription: string;
  };
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
