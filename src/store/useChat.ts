// src/store/useChat.ts
import { create } from 'zustand';
import type { Message } from '../types';

type RiskFlowStep = 'idle' | 'waiting_category' | 'waiting_event' | 'waiting_choice' | 'completed';

interface ChatState {
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  // Risk Management Flow State
  riskFlowStep: RiskFlowStep;
  riskSelectedCategory: string | null;
  riskAvailableEvents: string[];
  setRiskFlowState: (step: RiskFlowStep, category?: string | null, events?: string[]) => void;
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
  setRiskFlowState: (step, category = null, events = []) =>
    set({
      riskFlowStep: step,
      riskSelectedCategory: category,
      riskAvailableEvents: events,
    }),
}));
