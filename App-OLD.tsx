import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './src/styles/custom.css';
import TopNav from './src/components/layout/TopNav';
import ChatWindow from './src/components/chat/ChatWindow';
import Sidebar from './src/components/sidebar/Sidebar';
import RiskReport from './src/components/RiskReport';
import SydAgentPanel from './src/components/sydAgent/SydAgentPanel';
import Login from './src/components/auth/Login';
import { VideoPresentation } from './src/components/presentation/VideoPresentation';
import GuidedTour from './src/components/tour/GuidedTour';
import { useAppStore } from './src/store/useStore';
import { useChatStore } from './src/store';
import { useRiskFlow } from './src/hooks/useRiskFlow';
import { setupStoreDebug } from './src/debug/storeDebug';

function App() {
  const theme = useAppStore((state) => state.theme);
  const showRiskReport = useAppStore((state) => state.showRiskReport);
  const setShowRiskReport = useAppStore((state) => state.setShowRiskReport);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const uploadedFiles = useAppStore((state) => state.uploadedFiles);

  // Stato per controllare se Syd Agent è aperto
  const [isSydAgentOpen, setIsSydAgentOpen] = useState(false);
  // const updateContext = useChatStore((state) => state.updateContext); // Temporaneamente disabilitato

  // DEBUG: Log dello stato
  useEffect(() => {
    console.log('🔴 Syd Agent è:', isSydAgentOpen ? 'APERTO (dovrebbe essere w-96)' : 'CHIUSO (dovrebbe essere w-0 ma VISIBILE come riga rossa)');
  }, [isSydAgentOpen]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Setup debug tools on mount
  useEffect(() => {
    setupStoreDebug();
  }, []);

  // Aggiorna il contesto quando cambiano i componenti visibili
  useEffect(() => {
    // Temporaneamente disabilitato per debug
    // TODO: Implementare passaggio contesto all'agente senza modificare le sue logiche
    /*
    const visibleComponents = [];
    
    // Traccia componenti visibili
    if (showRiskReport) visibleComponents.push('RiskReport');
    if (uploadedFiles.length > 0) visibleComponents.push('UploadedFiles');
    
    // Traccia file caricati
    const fileNames = uploadedFiles.map(f => f.name);
    
    updateContext({
      visibleComponents,
      uploadedFiles: fileNames,
    });
    */
  }, [showRiskReport, uploadedFiles]);

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

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

      {/* LAYOUT SEMPLICE E FUNZIONANTE */}
      <main className="flex-1 overflow-hidden">

        {/* Desktop: Layout SUPER SEMPLICE */}
        <div className="hidden lg:flex h-full">

          {/* Sidebar - larghezza fissa */}
          <div className="w-[225px] flex-shrink-0 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <Sidebar onOpenSydAgent={() => setIsSydAgentOpen(true)} />
          </div>

          {/* Chat - occupa TUTTO lo spazio rimanente */}
          <div className="flex-1 p-4 overflow-hidden">
            <ChatWindow />
          </div>

          {/* Syd Agent - appare/scompare con transizione */}
          <div className={`${isSydAgentOpen ? 'w-96' : 'w-0'} flex-shrink-0 border-l border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300`}>
            <div className="w-96">
              <SydAgentPanel
                isOpen={isSydAgentOpen}
                onClose={() => setIsSydAgentOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Tablet: Flex semplice con drawer */}
        <div className="hidden md:flex lg:hidden h-full relative">
          {/* Sidebar fissa */}
          <aside className="w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <Sidebar onOpenSydAgent={() => setIsSydAgentOpen(true)} />
          </aside>

          {/* Chat fluida */}
          <main className="flex-1 p-4 min-w-0 overflow-hidden">
            <ChatWindow />
          </main>

          {/* Syd Drawer Overlay */}
          {isSydAgentOpen && (
            <div
              className="absolute inset-0 bg-black/20 z-40"
              onClick={() => setIsSydAgentOpen(false)}
            />
          )}
          <aside className={`
            absolute top-0 right-0 h-full w-80 z-50
            bg-background-light dark:bg-background-dark
            shadow-xl
            transition-transform duration-300
            ${isSydAgentOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <SydAgentPanel
              isOpen={isSydAgentOpen}
              onClose={() => setIsSydAgentOpen(false)}
            />
          </aside>
        </div>

        {/* Mobile: Tab navigation con animazioni */}
        <div className="flex md:hidden h-full relative">
          {/* Tab Bar in basso */}
          <div className="absolute bottom-0 left-0 right-0 z-50
            bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
            border-t border-slate-200 dark:border-slate-700
            px-2 py-2
          ">
            <div className="flex gap-2">
              <button
                onClick={() => setIsSydAgentOpen(false)}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  !isSydAgentOpen
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setIsSydAgentOpen(true)}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  isSydAgentOpen
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Syd Agent
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 pb-20 w-full overflow-hidden">
            {isSydAgentOpen ? (
              <SydAgentPanel
                isOpen={isSydAgentOpen}
                onClose={() => setIsSydAgentOpen(false)}
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 overflow-hidden">
                  <ChatWindow />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Risk Report Modal */}
      {showRiskReport && (
        <RiskReport onClose={() => setShowRiskReport(false)} />
      )}
      
      {/* Pulsante per aprire Syd Agent (integrato nella sidebar ora) */}
      
      {/* Video Presentation */}
      <VideoPresentation />

      {/* Guided Tour */}
      <GuidedTour />
    </div>
  );
}

export default App;