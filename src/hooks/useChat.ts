
import { useCallback } from 'react';
import { useAppStore } from '../store/useStore';
import { sendMessage as sendApiMessage } from '../api/assistant';

export const useChat = () => {
  const {
    addMessage,
    updateLastAgentMessage,
    setIsSydTyping,
    uploadedFiles,
  } = useAppStore();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString(),
    };
    addMessage(userMessage);
    setIsSydTyping(true);

    const agentMessage = {
      id: `agent-${Date.now()}`,
      text: '',
      sender: 'agent' as const,
      timestamp: new Date().toLocaleTimeString(),
    };
    addMessage(agentMessage);

    try {
      // TODO: Once APIs are real, pass the actual uploaded file data.
      const stream = sendApiMessage(text, uploadedFiles);
      for await (const chunk of stream) {
        updateLastAgentMessage(chunk);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateLastAgentMessage("Sorry, something went wrong. Please try again.");
    } finally {
      setIsSydTyping(false);
    }
  }, [addMessage, setIsSydTyping, updateLastAgentMessage, uploadedFiles]);

  return { sendMessage };
};
