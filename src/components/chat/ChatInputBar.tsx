// src/components/chat/ChatInputBar.tsx
import React, { useState } from "react";
import { Send, Hash } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store";
import { useTranslations } from "../../hooks/useTranslations";

const ChatInputBar: React.FC = () => {
  const [text, setText] = useState("");
  const [eventNumber, setEventNumber] = useState("");
  const { sendMessage } = useChat();
  const t = useTranslations();
  const riskFlowStep = useChatStore((state) => state.riskFlowStep);
  
  // Mostra input numero solo quando siamo in attesa di selezione evento
  const showEventInput = riskFlowStep === 'waiting_event';

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
          className="w-full max-h-40 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
