
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Languages, PlusCircle, Sparkles, LogOut, User } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { useChatStore } from '../../store';
import { useTranslations } from '../../hooks/useTranslations';
import { useRiskFlow } from '../../hooks/useRiskFlow';
import toast from 'react-hot-toast';

const TopNav: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage, clearAllFiles, updateSessionMeta, logout, currentUser } = useAppStore();
  const { clearMessages } = useChatStore();
  const { resetRiskFlow } = useRiskFlow();
  const t = useTranslations();

  const handleNewChat = () => {
    clearMessages();
    clearAllFiles();
    resetRiskFlow(); // Reset completo del Risk Management
    updateSessionMeta({
      ateco: '',
      settore: '',
      normative: '',
      certificazioni: ''
    });
    toast.success('✨ Nuova sessione avviata!');
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-900 to-blue-900 dark:from-slate-900 dark:to-blue-950 text-white shadow-2xl backdrop-blur-sm border-b border-blue-800/30"
    >
      <motion.div 
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Sparkles className="text-sky-400" size={24} />
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          {t.appName || 'SYD Cyber'}
        </h1>
      </motion.div>
      
      <div className="flex items-center space-x-3">
        {/* User Info */}
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <User size={18} className="text-green-400" />
          <span className="text-sm font-medium text-white">{currentUser}</span>
        </motion.div>
        <motion.button
          onClick={handleNewChat}
          title={t.newChat || 'Nuova Chat'}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">{t.newChat || 'Nuova Chat'}</span>
        </motion.button>

<motion.div
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Languages size={18} className="text-blue-400" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value as 'en' | 'it');
              toast.success(e.target.value === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English');
            }}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-medium"
            aria-label={t.language || 'Language'}
          >
            <option value="en" className="text-slate-900 bg-white">EN</option>
            <option value="it" className="text-slate-900 bg-white">IT</option>
          </select>
        </motion.div>

        <motion.button
          onClick={() => {
            toggleTheme();
            toast.success(theme === 'light' ? '🌙 Modalità scura' : '☀️ Modalità chiara');
          }}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          aria-label={t.theme || 'Theme'}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Moon size={20} className="text-blue-400" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Sun size={20} className="text-yellow-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Logout Button */}
        <motion.button
          onClick={() => {
            logout();
            toast.success('👋 Arrivederci!');
          }}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 transition-all duration-200 backdrop-blur-sm"
          aria-label="Logout"
          title="Logout"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <LogOut size={20} className="text-red-400" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default TopNav;
