// EXPORT CENTRALIZZATO - NUOVO SISTEMA VANILLA STORE
// Per retrocompatibilità esportiamo useChatStore come funzione
import { useChatStoreCompat } from './useChatStore';

// Export per retrocompatibilità (vecchio codice che usa useChatStore())
export const useChatStore = useChatStoreCompat;

// Export nuovo sistema (preferito per real-time)
export {
  useChatStore as useChat,
  useMessages,
  useAddMessage,
  useUpdateMessage,
  useClearMessages,
  useRiskFlowStep,
  useRiskSelectedCategory,
  useRiskAssessmentData,
  useSetRiskFlowState,
  useSetRiskAssessmentData,
  useCurrentStepDetails,
  useSetCurrentStepDetails
} from './useChatStore';

// Export app store invariato
export { useAppStore } from './useStore';

// Export vanilla store per accesso diretto
export { chatStore } from './chatStore';