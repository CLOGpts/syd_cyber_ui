
import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { Message } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, text, timestamp } = message;
  const isAgent = sender === 'agent';
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleClasses = isAgent
    ? 'bg-slate-200 dark:bg-slate-700'
    : 'bg-primary-light text-white';
  
  const alignmentClasses = isAgent ? 'justify-start' : 'justify-end';
  const avatarOrder = isAgent ? 'order-1' : 'order-2';
  const textOrder = isAgent ? 'order-2' : 'order-1';
  
  const Avatar = () => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAgent ? 'bg-slate-400' : 'bg-blue-400'}`}>
      {isAgent ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
    </div>
  );

  return (
    <div className={`flex items-end gap-2 ${alignmentClasses}`}>
      <div className={avatarOrder}>
        <Avatar />
      </div>
      <div className={`max-w-md lg:max-w-2xl group relative ${textOrder}`}>
        <div className={`px-4 py-2 rounded-2xl ${bubbleClasses}`}>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
        <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 px-2 text-right">{timestamp}</div>
        {isAgent && (
          <button
            onClick={handleCopy}
            className="absolute -top-3 -right-3 p-1.5 bg-card-light dark:bg-slate-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title={copied ? t.copied : t.copy}
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-text-muted-light dark:text-text-muted-dark" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
