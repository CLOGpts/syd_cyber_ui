// src/store/useChat.ts
import { create } from 'zustand';
import type { Message } from '../types';

type RiskFlowStep = 'idle' | 'waiting_category' | 'waiting_event' | 'waiting_choice' | 'assessment_q1' | 'assessment_q2' | 'assessment_q3' | 'assessment_q4' | 'assessment_q5' | 'assessment_q6' | 'assessment_q7' | 'assessment_q8' | 'assessment_complete' | 'completed';

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

interface ChatState {
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  // Risk Management Flow State
  riskFlowStep: RiskFlowStep;
  riskSelectedCategory: string | null;
  riskAvailableEvents: string[];
  riskAssessmentData: RiskAssessmentData | null;
  riskAssessmentFields: any[];
  setRiskFlowState: (step: RiskFlowStep, category?: string | null, events?: string[]) => void;
  setRiskAssessmentData: (data: Partial<RiskAssessmentData>) => void;
  setRiskAssessmentFields: (fields: any[]) => void;
  
  // Syd Agent Context
  selectedCategory?: string;
  selectedEvent?: string;
  currentAssessmentQuestion?: number;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
  
  // Risk Management Flow State
  riskFlowStep: 'idle',
  riskSelectedCategory: null,
  riskAvailableEvents: [],
  riskAssessmentData: null,
  riskAssessmentFields: [],
  setRiskFlowState: (step, category = null, events = []) =>
    set({
      riskFlowStep: step,
      riskSelectedCategory: category,
      riskAvailableEvents: events,
    }),
  setRiskAssessmentData: (data) =>
    set((state) => ({
      riskAssessmentData: state.riskAssessmentData 
        ? { ...state.riskAssessmentData, ...data }
        : data as RiskAssessmentData,
    })),
  setRiskAssessmentFields: (fields) =>
    set({ riskAssessmentFields: fields }),
}));
