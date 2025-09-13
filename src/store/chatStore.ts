// VANILLA STORE - UNICA ISTANZA GLOBALE
import { createStore } from 'zustand/vanilla';
import type { Message } from '../types';

// Types
type RiskFlowStep = 'idle' | 'waiting_category' | 'waiting_event' | 'waiting_choice' | 
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
  
  // Risk Management Flow
  riskFlowStep: RiskFlowStep;
  riskSelectedCategory: string | null;
  riskAvailableEvents: string[];
  riskAssessmentData: RiskAssessmentData | null;
  riskAssessmentFields: any[];
  
  // Syd Agent Context
  selectedCategory?: string;
  selectedEvent?: string;
  currentAssessmentQuestion?: number;
  
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
}

function createChatStore() {
  return createStore<ChatState>((set, get) => ({
    // Initial state
    messages: [],
    conversationHistory: [],
    currentContext: {
      visibleComponents: [],
    },
    riskFlowStep: 'idle',
    riskSelectedCategory: null,
    riskAvailableEvents: [],
    riskAssessmentData: null,
    riskAssessmentFields: [],
    
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