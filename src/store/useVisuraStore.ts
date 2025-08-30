import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VisuraData, VisuraUIState } from '../types/visura.types';

interface VisuraStore extends VisuraUIState {
  // Actions
  setVisuraData: (data: VisuraData | null) => void;
  setExtractionStatus: (status: { 
    isExtracting: boolean; 
    error?: string | null;
    confidence?: number;
  }) => void;
  clearVisuraData: () => void;
  
  // Getters helpers
  hasVisuraData: () => boolean;
  getPrimaryATECO: () => string | null;
  getCompanyName: () => string | null;
  getPEC: () => string | null;
}

export const useVisuraStore = create<VisuraStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isExtracting: false,
      extractedData: null,
      error: null,
      lastExtractionTime: null,
      confidence: 0,

      // Actions
      setVisuraData: (data) => set({
        extractedData: data,
        error: null,
        lastExtractionTime: data ? new Date().toISOString() : null,
        confidence: data?.confidence || 0
      }),

      setExtractionStatus: ({ isExtracting, error, confidence }) => set({
        isExtracting,
        error: error || null,
        confidence: confidence || get().confidence
      }),

      clearVisuraData: () => set({
        extractedData: null,
        error: null,
        lastExtractionTime: null,
        confidence: 0,
        isExtracting: false
      }),

      // Helper getters
      hasVisuraData: () => get().extractedData !== null,
      
      getPrimaryATECO: () => {
        const data = get().extractedData;
        if (!data?.codici_ateco?.length) return null;
        const primary = data.codici_ateco.find(a => a.principale);
        return primary?.codice || data.codici_ateco[0].codice;
      },

      getCompanyName: () => get().extractedData?.denominazione || null,
      
      getPEC: () => get().extractedData?.pec || null,
    }),
    {
      name: 'visura-storage',
      partialize: (state) => ({
        extractedData: state.extractedData,
        lastExtractionTime: state.lastExtractionTime,
        confidence: state.confidence
      })
    }
  )
);