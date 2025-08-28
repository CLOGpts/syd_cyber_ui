
import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslations } from '../../hooks/useTranslations';

const TypingIndicator: React.FC = () => {
    const t = useTranslations();
    return (
        <div className="flex items-end gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-400">
                <Bot size={20} className="text-white" />
            </div>
            <div className="max-w-md lg:max-w-2xl">
                <div className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center space-x-2">
                    <span className="text-sm text-text-muted-light dark:text-text-muted-dark italic mr-2">{t.sydIsTyping}</span>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
