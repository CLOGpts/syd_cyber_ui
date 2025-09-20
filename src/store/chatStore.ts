// VANILLA STORE - UNICA ISTANZA GLOBALE
import { createStore } from 'zustand/vanilla';
import type { Message } from '../types';

// Types
type RiskFlowStep = 'idle' | 'waiting_category' | 'waiting_event' | 'waiting_choice' |
  'waiting_event_change_confirmation' |
  'assessment_q1' | 'assessment_q2' | 'assessment_q3' | 'assessment_q4' |
  'assessment_q5' | 'assessment_q6' | 'assessment_q7' | 'assessment_q8' |
  'assessment_complete' | 'completed';

interface RiskAssessmentData {
  eventCode: string;
  category: string;
  impatto_finanziario?: string;
  perdita_economica?: string;
  impatto_immagine?: string;
  impatto_regolamentare?: string;
  impatto_criminale?: string;
  perdita_non_economica?: string;
  controllo?: string;
  descrizione_controllo?: string;
}

// Stati conversazionali per visione olistica
export type ConversationalState = 'idle' | 'exploring' | 'educating' | 'assessing';

// Prima analisi memorizzata
export interface FirstAnalysis {
  atecoEstimated: string;
  atecoDescription: string;
  confidence: number;
  sector: string;
  mainRisks: string[];
  regulations: string[];
  quickWins: string[];
  businessDescription: string;
  timestamp: string;
}

export interface ChatState {
  // Messages
  messages: Message[];
  conversationHistory: Message[];

  // Context
  currentContext: {
    visibleComponents: string[];
    activeTab?: string;
    uploadedFiles?: string[];
    currentRiskStep?: string;
    sessionData?: any;
  };

  // VISIONE OLISTICA: Stato conversazionale e memoria
  conversationalState: ConversationalState;
  firstAnalysis: FirstAnalysis | null;

  // Risk Management Flow
  riskFlowStep: RiskFlowStep;
  riskSelectedCategory: string | null;
  riskAvailableEvents: string[];
  riskAssessmentData: RiskAssessmentData | null;
  riskAssessmentFields: any[];

  // CONTROLLO SELEZIONE EVENTI MULTIPLI
  selectedEventCode: string | null;
  pendingEventCode: string | null;

  // Dettagli precisi dello step corrente per Syd Agent
  currentStepDetails: {
    stepId: string;
    questionNumber?: number;
    totalQuestions?: number;
    questionText?: string;
    fieldName?: string;
    options?: Array<{value: string; label: string; description?: string}>;
    helpText?: string;
    eventCode?: string;
    categoryName?: string;
  } | null;

  // Syd Agent Context
  selectedCategory?: string;
  selectedEvent?: string;
  currentAssessmentQuestion?: number;

  // LOCKDOWN: Global process lock
  isRiskProcessLocked: boolean;

  // NUOVO: History Stack per Navigation
  riskFlowHistory: Array<{
    step: RiskFlowStep;
    data: Partial<RiskAssessmentData>;
    timestamp: string;
    questionNumber?: number;
    stepDetails?: ChatState['currentStepDetails'];
  }>;

  // Actions - TUTTE LE FUNZIONI ESISTENTI
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  saveToHistory: () => void;
  updateContext: (context: Partial<ChatState['currentContext']>) => void;
  getContextualPrompt: (userMessage: string) => string;
  setRiskFlowState: (step: RiskFlowStep, category?: string | null, events?: string[]) => void;
  setRiskAssessmentData: (data: Partial<RiskAssessmentData>) => void;
  setRiskAssessmentFields: (fields: any[]) => void;
  setCurrentStepDetails: (details: ChatState['currentStepDetails']) => void;

  // CONTROLLO EVENTI MULTIPLI: Nuove azioni
  setSelectedEventCode: (eventCode: string | null) => void;
  setPendingEventCode: (eventCode: string | null) => void;
  clearEventSelection: () => void;
  removeEventDescriptionMessages: () => void;

  // VISIONE OLISTICA: Nuove azioni
  setConversationalState: (state: ConversationalState) => void;
  setFirstAnalysis: (analysis: FirstAnalysis | null) => void;
  getFirstAnalysis: () => FirstAnalysis | null;

  // NUOVO: Azioni Navigation per Undo/Back
  pushRiskHistory: (step: RiskFlowStep, data: Partial<RiskAssessmentData>) => void;
  popRiskHistory: () => void;
  canGoBack: () => boolean;
  clearRiskHistory: () => void;

  // LOCKDOWN: Process lock actions
  setRiskProcessLocked: (locked: boolean) => void;
  isProcessLocked: () => boolean;
}

function createChatStore() {
  return createStore<ChatState>((set, get) => ({
    // Initial state
    messages: [],
    conversationHistory: [],
    currentContext: {
      visibleComponents: [],
    },
    conversationalState: 'idle',
    firstAnalysis: null,
    riskFlowStep: 'idle',
    riskSelectedCategory: null,
    riskAvailableEvents: [],
    riskAssessmentData: null,
    riskAssessmentFields: [],
    currentStepDetails: null,
    riskFlowHistory: [], // NUOVO: Inizializza history vuoto
    isRiskProcessLocked: false, // LOCKDOWN: Inizialmente sbloccato

    // CONTROLLO EVENTI MULTIPLI: Stato iniziale
    selectedEventCode: null,
    pendingEventCode: null,

    // Actions
    addMessage: (msg) => {
      console.log('🟢 [VANILLA STORE] Adding message:', msg.text?.substring(0, 30));
      set((state) => ({
        messages: [...state.messages, msg]
      }));
      console.log('🟢 [VANILLA STORE] Total messages:', get().messages.length);
    },
    
    updateMessage: (id, updates) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      }));
    },
    
    clearMessages: () => {
      console.log('🗑️ [VANILLA STORE] Clearing messages');
      set({ messages: [] });
    },
    
    saveToHistory: () => {
      set((state) => ({
        conversationHistory: [...state.conversationHistory, ...state.messages],
        messages: [],
      }));
    },
    
    updateContext: (context) => {
      set((state) => ({
        currentContext: { ...state.currentContext, ...context },
      }));
    },
    
    getContextualPrompt: (userMessage) => {
      const state = get();
      const contextInfo = [];
      
      if (state.currentContext.visibleComponents.length > 0) {
        contextInfo.push(`Componenti visibili: ${state.currentContext.visibleComponents.join(', ')}`);
      }
      
      if (state.riskFlowStep !== 'idle') {
        contextInfo.push(`Fase risk assessment: ${state.riskFlowStep}`);
        if (state.riskSelectedCategory) {
          contextInfo.push(`Categoria selezionata: ${state.riskSelectedCategory}`);
        }
      }
      
      if (state.currentContext.uploadedFiles?.length) {
        contextInfo.push(`File caricati: ${state.currentContext.uploadedFiles.join(', ')}`);
      }
      
      const recentMessages = state.messages.slice(-6).filter((m: any) => m.role === 'user');
      if (recentMessages.length > 0) {
        contextInfo.push(`Domande precedenti: ${recentMessages.map(m => m.text).join(' | ')}`);
      }
      
      const fullPrompt = contextInfo.length > 0 
        ? `[CONTESTO: ${contextInfo.join('; ')}]\n\n${userMessage}`
        : userMessage;
      
      return fullPrompt;
    },
    
    setRiskFlowState: (step, category = null, events = []) => {
      console.log('🎯 [VANILLA STORE] Risk flow state:', step);
      set({
        riskFlowStep: step,
        riskSelectedCategory: category,
        riskAvailableEvents: events,
      });
    },
    
    setRiskAssessmentData: (data) => {
      set((state) => ({
        riskAssessmentData: state.riskAssessmentData 
          ? { ...state.riskAssessmentData, ...data }
          : data as RiskAssessmentData,
      }));
    },
    
    setRiskAssessmentFields: (fields) => {
      set({ riskAssessmentFields: fields });
    },

    setCurrentStepDetails: (details) => {
      console.log('📍 [VANILLA STORE] Updating step details:', details?.stepId);
      set({ currentStepDetails: details });
    },

    // VISIONE OLISTICA: Implementazione nuove azioni
    setConversationalState: (state) => {
      console.log('🎯 [VANILLA STORE] Conversational state:', state);
      set({ conversationalState: state });
    },

    setFirstAnalysis: (analysis) => {
      console.log('💾 [VANILLA STORE] Saving first analysis:', analysis?.sector);
      set({ firstAnalysis: analysis });

      // Persisti anche in localStorage per mantenere tra sessioni
      if (analysis) {
        localStorage.setItem('sydFirstAnalysis', JSON.stringify(analysis));
      } else {
        localStorage.removeItem('sydFirstAnalysis');
      }
    },

    getFirstAnalysis: () => {
      const state = get();
      if (state.firstAnalysis) {
        return state.firstAnalysis;
      }

      // Prova a recuperare da localStorage
      const saved = localStorage.getItem('sydFirstAnalysis');
      if (saved) {
        try {
          const analysis = JSON.parse(saved);

          // VALIDAZIONE: controlla che i dati siano validi
          if (!analysis.atecoEstimated || !analysis.sector || !analysis.confidence ||
              analysis.atecoEstimated === 'undefined' || isNaN(analysis.confidence)) {
            console.warn('💀 Invalid saved analysis, removing corrupted data');
            localStorage.removeItem('sydFirstAnalysis');
            return null;
          }

          // Verifica che non sia troppo vecchio (24 ore)
          const timestamp = new Date(analysis.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            return analysis as FirstAnalysis;
          } else {
            console.log('⏰ Analysis too old, removing');
            localStorage.removeItem('sydFirstAnalysis');
          }
        } catch (e) {
          console.error('Error parsing saved analysis:', e);
          localStorage.removeItem('sydFirstAnalysis');
        }
      }

      return null;
    },

    // NUOVO: Navigation Methods per Undo/Back
    pushRiskHistory: (step, data) => {
      console.log('📥 [VANILLA STORE] pushRiskHistory called:', step, 'data:', data);
      set((state) => {
        const newEntry = {
          step,
          data: { ...state.riskAssessmentData, ...data },
          timestamp: new Date().toISOString(),
          questionNumber: state.currentAssessmentQuestion,
          stepDetails: state.currentStepDetails
        };
        let newHistory = [...state.riskFlowHistory, newEntry];

        // ANTIFRAGILE: Limita history a max 20 entries per prevenire memory leak
        const MAX_HISTORY_SIZE = 20;
        if (newHistory.length > MAX_HISTORY_SIZE) {
          console.log('🔄 History overflow, removing oldest entries');
          newHistory = newHistory.slice(-MAX_HISTORY_SIZE);
        }

        console.log('📥 [VANILLA STORE] New history length:', newHistory.length);
        return { riskFlowHistory: newHistory };
      });
    },

    popRiskHistory: () => {
      set((state) => {
        if (state.riskFlowHistory.length <= 1) {
          console.warn('⚠️ [VANILLA STORE] Cannot pop history - insufficient entries');
          return state;
        }

        const newHistory = state.riskFlowHistory.slice(0, -1);
        const previous = newHistory[newHistory.length - 1];

        if (!previous) {
          console.error('❌ [VANILLA STORE] No previous state found in history');
          return state;
        }

        console.log('📤 [VANILLA STORE] popRiskHistory - restoring step:', previous?.step, 'with details:', previous?.stepDetails);

        // ANTIFRAGILE: Validazione dello stato prima del restore
        const restoredState = {
          riskFlowHistory: newHistory,
          riskFlowStep: previous.step || 'idle',
          riskAssessmentData: previous.data || null,
          currentAssessmentQuestion: previous.questionNumber,
          currentStepDetails: previous.stepDetails || null
        };

        // ANTIFRAGILE: Log dello stato ripristinato per debug
        console.log('🔄 [VANILLA STORE] State restored:', {
          step: restoredState.riskFlowStep,
          historyLength: restoredState.riskFlowHistory.length,
          hasStepDetails: !!restoredState.currentStepDetails
        });

        return restoredState;
      });
    },

    canGoBack: () => {
      const historyLength = get().riskFlowHistory.length;
      const canGo = historyLength > 1;
      console.log('🔍 [VANILLA STORE] canGoBack check - history length:', historyLength, 'can go back:', canGo);
      return canGo;
    },

    clearRiskHistory: () => {
      set({ riskFlowHistory: [] });
    },

    // LOCKDOWN: Process lock implementation
    setRiskProcessLocked: (locked) => {
      console.log('🔒 [LOCKDOWN] Process locked:', locked);
      set({ isRiskProcessLocked: locked });

      // Update UI globally
      if (locked) {
        document.body.classList.add('risk-process-active');
      } else {
        document.body.classList.remove('risk-process-active');
      }
    },

    isProcessLocked: () => {
      return get().isRiskProcessLocked;
    },

    // CONTROLLO EVENTI MULTIPLI: Implementazione azioni
    setSelectedEventCode: (eventCode) => {
      console.log('🎯 [VANILLA STORE] Setting selected event:', eventCode);
      set({ selectedEventCode: eventCode });
    },

    setPendingEventCode: (eventCode) => {
      console.log('⏳ [VANILLA STORE] Setting pending event:', eventCode);
      set({ pendingEventCode: eventCode });
    },

    clearEventSelection: () => {
      console.log('🧹 [VANILLA STORE] Clearing event selection');
      set({
        selectedEventCode: null,
        pendingEventCode: null
      });
    },

    removeEventDescriptionMessages: () => {
      console.log('🗑️ [VANILLA STORE] Removing event description messages');
      set((state) => ({
        messages: state.messages.filter(msg =>
          msg.type !== 'risk-description' &&
          msg.type !== 'control-description'
        )
      }));
    },
  }));
}

// 👇 UNICA ISTANZA GLOBALE - sempre la stessa anche dopo HMR
const g = globalThis as any;
export const chatStore = g.__CHAT_STORE__ ?? (g.__CHAT_STORE__ = createChatStore());

// Preserva il riferimento durante HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    g.__CHAT_STORE__ = chatStore;
  });
}

// Debug: log quando lo store viene creato
if (!g.__CHAT_STORE_INITIALIZED__) {
  console.log('🚀 [VANILLA STORE] Created global singleton store');
  g.__CHAT_STORE_INITIALIZED__ = true;
}