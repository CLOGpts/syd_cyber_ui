// src/components/chat/ChatInputBar.tsx
import React, { useState, useRef, DragEvent } from "react";
import { Send, Paperclip, Hash } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { useUpload } from "../../hooks/useUpload";
import { useAppStore } from "../../store/useStore";
import { useChatStore } from "../../store/useChat";
import { useTranslations } from "../../hooks/useTranslations";

const ChatInputBar: React.FC = () => {
  const [text, setText] = useState("");
  const [eventNumber, setEventNumber] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { sendMessage } = useChat();
  const { handleFiles } = useUpload();
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFilesCount = useAppStore((state) => state.uploadedFiles.length);
  const riskFlowStep = useChatStore((state) => state.riskFlowStep);
  
  // Mostra input numero solo quando siamo in attesa di selezione evento
  const showEventInput = riskFlowStep === 'waiting_event';

  const handleSend = () => {
    if (!text.trim()) return;
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(over);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={`p-4 border-t border-slate-200 dark:border-slate-700 transition-colors ${
        isDragging ? "bg-blue-100 dark:bg-blue-900/50" : ""
      }`}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDrop={handleDrop}
    >
      {/* Area drag & drop */}
      <div
        className={`absolute inset-0 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center text-primary font-semibold pointer-events-none transition-opacity ${
          isDragging ? "opacity-100" : "opacity-0"
        }`}
      >
        {t.dropFilesHere}
      </div>

      {/* Barra input messaggi */}
      <div className="flex items-end gap-2">
        {/* Bottone attach file */}
        <button
          onClick={handleAttachClick}
          className="relative flex-shrink-0 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={t.attachFile}
        >
          <Paperclip
            size={20}
            className="text-text-muted-light dark:text-text-muted-dark"
          />
          {uploadedFilesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {uploadedFilesCount}
            </span>
          )}
        </button>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

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
