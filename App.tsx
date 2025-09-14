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
import { ChevronLeft, ChevronRight, MessageSquare, Menu, X } from 'lucide-react';

function App() {
  const theme = useAppStore((state) => state.theme);
  const showRiskReport = useAppStore((state) => state.showRiskReport);
  const setShowRiskReport = useAppStore((state) => state.setShowRiskReport);
  const showVideoPresentation = useAppStore((state) => state.showVideoPresentation);
  const setShowVideoPresentation = useAppStore((state) => state.setShowVideoPresentation);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const uploadedFiles = useAppStore((state) => state.uploadedFiles);

  // Stati per UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sydPanelOpen, setSydPanelOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setupStoreDebug();
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/10">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm',
          style: {
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
        }}
      />

      {/* Top Navigation */}
      <TopNav />

      {/* Main Container - Responsive */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* SIDEBAR - Design premium + Responsive */}
        <aside
          className={`
            relative bg-white/80 dark:bg-gray-900/80
            backdrop-blur-md
            border-r border-gray-200/50 dark:border-gray-800/50
            shadow-xl shadow-gray-200/20 dark:shadow-black/20
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarCollapsed ? 'w-20' : 'w-72'}
            flex flex-col
            hidden lg:flex
          `}
        >
          {/* Toggle Button - sempre visibile */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="
              absolute -right-4 top-8 z-30
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-full p-2 shadow-lg
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-all duration-200 hover:scale-110
            "
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Sidebar Content */}
          <div className="h-full overflow-y-auto">
            <Sidebar
              onOpenSydAgent={() => setSydPanelOpen(!sydPanelOpen)}
              isCollapsed={sidebarCollapsed}
            />
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>

        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarCollapsed(true)}
          >
            <aside className="w-72 h-full bg-white dark:bg-gray-900 shadow-xl">
              <Sidebar
                onOpenSydAgent={() => setSydPanelOpen(!sydPanelOpen)}
                isCollapsed={false}
              />
            </aside>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col relative">

          {/* CHAT AREA - Si ridimensiona quando Syd è aperto */}
          <div
            className={`
              flex justify-center overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${sydPanelOpen ? 'flex-[0.6]' : 'flex-1'}
            `}
          >
            <div className="w-full max-w-6xl p-6">
              <ChatWindow />
            </div>
          </div>

          {/* SYD AGENT - Bottom Panel premium */}
          <div
            className={`
              bg-gradient-to-t from-white via-white to-blue-50/10
              dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/10
              border-t-2 border-blue-500/20 dark:border-blue-400/20
              shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)]
              transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              ${sydPanelOpen ? 'flex-[0.4]' : 'h-0'}
              min-h-0 overflow-hidden
            `}
          >
            {/* Handle per resize */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800 cursor-ns-resize" />

            {/* Header del pannello Syd */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-blue-500" size={20} />
                <span className="font-semibold">Syd Agent</span>
              </div>
              <button
                onClick={() => setSydPanelOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <ChevronLeft className="rotate-90" size={20} />
              </button>
            </div>

            {/* Contenuto Syd */}
            <div className="h-full overflow-hidden">
              <SydAgentPanel
                isOpen={sydPanelOpen}
                onClose={() => setSydPanelOpen(false)}
              />
            </div>
          </div>

          {/* FAB più elegante per Syd */}
          {!sydPanelOpen && (
            <button
              onClick={() => setSydPanelOpen(true)}
              className="
                absolute bottom-6 right-6
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                text-white
                rounded-2xl px-5 py-3
                shadow-lg hover:shadow-xl
                transition-all duration-300
                flex items-center gap-2
                group
              "
            >
              <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-sm">Syd AI</span>
            </button>
          )}
        </main>
      </div>

      {/* Modals */}
      {showRiskReport && (
        <RiskReport onClose={() => setShowRiskReport(false)} />
      )}

      <VideoPresentation
        isOpen={showVideoPresentation}
        onClose={() => setShowVideoPresentation(false)}
      />
      <GuidedTour />
    </div>
  );
}

export default App;