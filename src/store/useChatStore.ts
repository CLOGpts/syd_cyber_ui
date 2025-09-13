// HOOK REACT PER IL VANILLA STORE
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { chatStore, type ChatState } from './chatStore';

// Hook principale con selector - GARANTISCE REAL-TIME UPDATES
export const useChatStore = <T>(
  selector: (s: ChatState) => T,
  equalityFn = shallow
) => useStore(chatStore, selector, equalityFn);

// Helper hooks per uso comune
export const useMessages = () => useChatStore((s) => s.messages);
export const useAddMessage = () => useChatStore((s) => s.addMessage);
export const useUpdateMessage = () => useChatStore((s) => s.updateMessage);
export const useClearMessages = () => useChatStore((s) => s.clearMessages);

// Risk flow helpers
export const useRiskFlowStep = () => useChatStore((s) => s.riskFlowStep);
export const useRiskSelectedCategory = () => useChatStore((s) => s.riskSelectedCategory);
export const useRiskAssessmentData = () => useChatStore((s) => s.riskAssessmentData);
export const useSetRiskFlowState = () => useChatStore((s) => s.setRiskFlowState);
export const useSetRiskAssessmentData = () => useChatStore((s) => s.setRiskAssessmentData);

// Funzione helper per compatibilità con vecchio codice
// IMPORTANTE: Per real-time sync, SEMPRE usare con selector!
export function useChatStoreCompat() {
  // Questo è per retrocompatibilità, ma NON garantisce real-time updates
  // Meglio usare i selector specifici sopra
  const messages = useMessages();
  const addMessage = useAddMessage();
  const updateMessage = useUpdateMessage();
  const clearMessages = useClearMessages();
  const riskFlowStep = useRiskFlowStep();
  const riskSelectedCategory = useRiskSelectedCategory();
  const riskAssessmentData = useRiskAssessmentData();
  const setRiskFlowState = useSetRiskFlowState();
  const setRiskAssessmentData = useSetRiskAssessmentData();
  const riskAvailableEvents = useChatStore((s) => s.riskAvailableEvents);
  const riskAssessmentFields = useChatStore((s) => s.riskAssessmentFields);
  const setRiskAssessmentFields = useChatStore((s) => s.setRiskAssessmentFields);
  const conversationHistory = useChatStore((s) => s.conversationHistory);
  const saveToHistory = useChatStore((s) => s.saveToHistory);
  const currentContext = useChatStore((s) => s.currentContext);
  const updateContext = useChatStore((s) => s.updateContext);
  const getContextualPrompt = useChatStore((s) => s.getContextualPrompt);
  
  return {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    riskFlowStep,
    riskSelectedCategory,
    riskAssessmentData,
    setRiskFlowState,
    setRiskAssessmentData,
    riskAvailableEvents,
    riskAssessmentFields,
    setRiskAssessmentFields,
    conversationHistory,
    saveToHistory,
    currentContext,
    updateContext,
    getContextualPrompt
  };
}