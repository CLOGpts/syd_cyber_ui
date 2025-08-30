import { create } from 'zustand';

interface VisuraStore {
  extractionStatus: {
    status: 'idle' | 'extracting' | 'success' | 'error';
    method?: 'backend' | 'ai' | 'chat';
    message?: string;
  };
  setExtractionStatus: (status: VisuraStore['extractionStatus']) => void;
  resetStatus: () => void;
}

export const useVisuraStore = create<VisuraStore>((set) => ({
  extractionStatus: { status: 'idle' },
  
  setExtractionStatus: (status) => set({ extractionStatus: status }),
  
  resetStatus: () => set({ 
    extractionStatus: { status: 'idle' } 
  }),
}));