
import React from 'react';
import { Moon, Sun, Languages, PlusCircle } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { useTranslations } from '../../hooks/useTranslations';

const TopNav: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage, resetChat, clearAllFiles } = useAppStore();
  const t = useTranslations();

  const handleNewChat = () => {
    resetChat();
    clearAllFiles();
  }

  return (
    <header className="flex items-center justify-between p-4 bg-header-light dark:bg-header-dark text-white shadow-md">
      <h1 className="text-xl font-bold tracking-wider">{t.appName}</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleNewChat}
          title={t.newChat}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/20 transition-colors"
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">{t.newChat}</span>
        </button>

        <div className="flex items-center space-x-2">
          <Languages size={20} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'it')}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            aria-label={t.language}
          >
            <option value="en" className="text-black">EN</option>
            <option value="it" className="text-black">IT</option>
          </select>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label={t.theme}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default TopNav;
