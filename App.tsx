import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import TopNav from './src/components/layout/TopNav';
import ChatWindow from './src/components/chat/ChatWindow';
import Sidebar from './src/components/sidebar/Sidebar';
import RiskReport from './src/components/RiskReport';
import { useAppStore } from './src/store/useStore';
import { useChatStore } from './src/store/useChat';
import { useRiskFlow } from './src/hooks/useRiskFlow';

function App() {
  const theme = useAppStore((state) => state.theme);
  const showRiskReport = useAppStore((state) => state.showRiskReport);
  const setShowRiskReport = useAppStore((state) => state.setShowRiskReport);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-sans">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark',
          style: {
            border: '1px solid #475569',
          },
        }}
      />
      <TopNav />
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 md:w-2/3 lg:w-3/4 flex flex-col p-4 gap-4">
          <ChatWindow />
        </div>
        <div className="w-full md:w-1/3 lg:w-1/4 p-4 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
          <Sidebar />
        </div>
      </main>
      
      {/* Risk Report Modal */}
      {showRiskReport && (
        <RiskReport onClose={() => setShowRiskReport(false)} />
      )}
    </div>
  );
}

export default App;