// src/components/chat/ChatInputBar.tsx
import React, { useState, useEffect } from "react";
import { Send, Hash } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { useRiskFlowStep } from "../../store";
import { useTranslations } from "../../hooks/useTranslations";
import { chatStore } from "../../store/chatStore";

const ChatInputBar: React.FC = () => {
  const [text, setText] = useState("");
  const [eventNumber, setEventNumber] = useState("");
  // INIZIALIZZA con valore corrente invece di false!
  const [isRiskProcessLocked, setIsRiskProcessLocked] = useState(() =>
    chatStore.getState().isRiskProcessLocked || false
  );
  const { sendMessage } = useChat();
  const t = useTranslations();
  const riskFlowStep = useRiskFlowStep();

  // Hook reattivo per monitorare isRiskProcessLocked
  useEffect(() => {
    const checkRiskLock = () => {
      const state = chatStore.getState();
      setIsRiskProcessLocked(state.isRiskProcessLocked);
    };

    checkRiskLock();
    const interval = setInterval(checkRiskLock, 100); // Ridotto a 100ms per maggiore reattività
    return () => clearInterval(interval);
  }, []);

  // Mostra input numero solo quando siamo in attesa di selezione evento
  const showEventInput = riskFlowStep === 'waiting_event';

  // Chat dedicata SOLO al Risk Management - nascondi SEMPRE tranne quando serve
  // Mostra SOLO quando stiamo effettivamente interagendo con il risk flow
  const showChatInput = false; // Per ora SEMPRE nascosta come richiesto

  const handleSend = () => {
    if (!text.trim()) return;
    
    // Temporaneamente disabilitato per non interferire con l'agente
    // const { getContextualPrompt } = useChatStore.getState();
    // const contextualMessage = getContextualPrompt(text.trim());
    
    sendMessage(text.trim());
    setText("");
  };

  const handleEventNumberSubmit = () => {
    if (!eventNumber.trim()) return;
    sendMessage(eventNumber.trim());
    setEventNumber("");
  };

  const handleEventKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEventNumberSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  // Chat SEMPRE nascosta come da requisito
  if (!showChatInput) {
    return null;
  }

  return (
    <div
      className="p-4 border-t border-slate-200 dark:border-slate-700 transition-colors"
    >

      {/* Barra input messaggi */}
      <div className="flex items-end gap-2">

        {/* Input numero evento - appare solo quando in attesa di selezione evento */}
        {showEventInput && (
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 border-2 border-blue-400 rounded-lg px-3 py-2 animate-pulse">
            <Hash size={16} className="text-blue-600 dark:text-blue-300 flex-shrink-0" />
            <input
              type="text"
              value={eventNumber}
              onChange={(e) => setEventNumber(e.target.value)}
              onKeyDown={handleEventKeyDown}
              placeholder="501"
              className="w-20 bg-transparent focus:outline-none text-sm font-mono text-blue-700 dark:text-blue-200 placeholder-blue-400"
              autoFocus
            />
          </div>
        )}

        {/* Textarea per scrivere i messaggi */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.sendMessagePlaceholder}
          className="w-full max-h-40 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 backdrop-blur-sm"
          rows={1}
        />

        {/* Pulsante invio */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex-shrink-0 p-2 rounded-full bg-primary text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
          title={t.send}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;
