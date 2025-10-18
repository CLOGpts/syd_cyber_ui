
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message, UploadFile, SessionMeta } from '../types';
import type { Language } from '../i18n/translations';

interface AppState {
  theme: 'light' | 'dark';
  language: Language;
  messages: Message[];
  uploadedFiles: UploadFile[];
  sessionMeta: SessionMeta;
  isSydTyping: boolean;
  showRiskReport: boolean;
  showRiskWizard: boolean;
  showVideoPresentation: boolean;
  showFeedbackModal: boolean;
  isAuthenticated: boolean;
  currentUser: string | null;
  userId: string | null;
  authToken: string | null;

  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setShowRiskReport: (show: boolean) => void;
  setShowRiskWizard: (show: boolean) => void;
  setShowVideoPresentation: (show: boolean) => void;
  setShowFeedbackModal: (show: boolean) => void;
  login: (username: string, userId: string) => void;
  logout: () => void;
  
  addMessage: (message: Message) => void;
  updateLastAgentMessage: (chunk: string) => void;
  setIsSydTyping: (isTyping: boolean) => void;
  resetChat: () => void;

  addFile: (file: UploadFile) => void;
  updateFileStatus: (id: string, status: 'completed' | 'error', error?: string) => void;
  removeFile: (id: string) => void;
  clearAllFiles: () => void;

  updateSessionMeta: (data: Partial<SessionMeta>) => void;
  setSessionMeta: (data: SessionMeta) => void;
}

const initialSessionMeta: SessionMeta = {
  // Nessun ATECO preimpostato - Syd deve chiedere sempre
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'it',
      messages: [],
      uploadedFiles: [],
      sessionMeta: initialSessionMeta,
      isSydTyping: false,
      showRiskReport: false,
      showRiskWizard: false,
      showVideoPresentation: false,
      showFeedbackModal: false,
      isAuthenticated: false,
      currentUser: null,
      userId: null,
      authToken: null,

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (lang) => set({ language: lang }),
      setShowRiskReport: (show) => set({ showRiskReport: show }),
      setShowRiskWizard: (show) => set({ showRiskWizard: show }),
      setShowVideoPresentation: (show) => set({ showVideoPresentation: show }),
      setShowFeedbackModal: (show) => set({ showFeedbackModal: show }),
      login: (username, userId) => {
        console.log('[Store] Login:', { username, userId });
        set({
          isAuthenticated: true,
          currentUser: username,
          userId: userId,
          authToken: userId // For now, use userId as token
        });
      },
      logout: () => {
        console.log('[Store] Logout - clearing session data');
        set({
          isAuthenticated: false,
          currentUser: null,
          userId: null,
          authToken: null,
          messages: [],
          uploadedFiles: [],
          sessionMeta: initialSessionMeta
        });
      },

      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateLastAgentMessage: (chunk) => {
        set((state) => {
          const lastMessage = state.messages[state.messages.length - 1];
          if (lastMessage && lastMessage.sender === 'agent') {
            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
            return { messages: [...state.messages.slice(0, -1), updatedMessage] };
          }
          return {};
        });
      },
      setIsSydTyping: (isTyping) => set({ isSydTyping: isTyping }),
      resetChat: () => set({ messages: [] }),

      addFile: (file) => set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),
      updateFileStatus: (id, status, error) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((f) =>
            f.id === id ? { ...f, status, error } : f
          ),
        }));
      },
      removeFile: (id) => set((state) => ({ uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id) })),
      clearAllFiles: () => set({ uploadedFiles: [] }),

      updateSessionMeta: (data) => set((state) => ({ sessionMeta: { ...state.sessionMeta, ...data } })),
      setSessionMeta: (data) => set({ sessionMeta: data }),
    }),
    {
      name: 'syd-cyber-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        userId: state.userId,
        authToken: state.authToken
      }),
    }
  )
);
