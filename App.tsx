import React, { useEffect, useState, useCallback } from 'react';
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
import ResizeHandle from './src/components/layout/ResizeHandle';
import { useAppStore } from './src/store/useStore';
import { useChatStore } from './src/store';
import { useRiskFlow } from './src/hooks/useRiskFlow';
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

  // Stati per ridimensionamento dinamico
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved) : 288; // 288px = 18rem (w-72)
  });
  const [sydPanelWidth, setSydPanelWidth] = useState(() => {
    const saved = localStorage.getItem('sydPanelWidth');
    return saved ? parseInt(saved) : 384; // 384px = 24rem (w-96)
  });
  const [chatMaxWidth, setChatMaxWidth] = useState(() => {
    const saved = localStorage.getItem('chatMaxWidth');
    return saved ? parseInt(saved) : 1536; // 1536px = 96rem (max-w-6xl)
  });

  // Salva le dimensioni in localStorage
  const saveSidebarWidth = useCallback((width: number) => {
    localStorage.setItem('sidebarWidth', width.toString());
  }, []);

  const saveSydPanelWidth = useCallback((width: number) => {
    localStorage.setItem('sydPanelWidth', width.toString());
  }, []);

  const saveChatMaxWidth = useCallback((width: number) => {
    localStorage.setItem('chatMaxWidth', width.toString());
  }, []);

  // Gestori del ridimensionamento
  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth(prev => {
      const newWidth = Math.max(200, Math.min(480, prev + delta));
      return newWidth;
    });
  }, []);

  const handleSydResize = useCallback((delta: number) => {
    setSydPanelWidth(prev => {
      const newWidth = Math.max(320, Math.min(640, prev - delta)); // Negativo perché è a destra
      return newWidth;
    });
  }, []);

  const handleChatResize = useCallback((delta: number) => {
    setChatMaxWidth(prev => {
      const newWidth = Math.max(768, Math.min(1920, prev + delta));
      return newWidth;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
            relative bg-white/95 dark:bg-gray-900/95
            backdrop-blur-md
            border-r border-gray-200/50 dark:border-gray-800/50
            shadow-xl shadow-gray-200/20 dark:shadow-black/20
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            flex flex-col
            hidden lg:flex
            my-4 ml-4 rounded-l-xl
            h-[calc(100%-2rem)]
          `}
          style={{
            width: sidebarCollapsed ? '80px' : `${sidebarWidth}px`
          }}
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

        {/* Resize Handle per Sidebar */}
        {!sidebarCollapsed && (
          <ResizeHandle
            onResize={handleSidebarResize}
            onResizeEnd={() => saveSidebarWidth(sidebarWidth)}
            className="hidden lg:block"
          />
        )}

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

        {/* MAIN CONTENT AREA - Si adatta quando Syd è aperto */}
        <main className={`
          flex-1 flex flex-col relative
          transition-all duration-300 ease-in-out
          pt-4 pb-4
          ${sydPanelOpen ? 'lg:mr-96' : ''}
        `}>

          {/* CHAT AREA - Responsive con Syd */}
          <div className="flex-1 flex justify-center overflow-hidden relative">
            <div
              className="w-full px-4 sm:px-6 transition-all duration-300 ease-in-out h-full relative"
              style={{
                maxWidth: `${chatMaxWidth}px`
              }}
            >
              <ChatWindow />

              {/* Resize Handles per la chat - sui bordi */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 w-1 cursor-col-resize
                  hover:bg-sky-500/50 transition-colors duration-200
                  hidden lg:block
                `}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = chatMaxWidth;

                  const handleMouseMove = (e: MouseEvent) => {
                    const delta = startX - e.clientX;
                    handleChatResize(delta);
                  };

                  const handleMouseUp = () => {
                    saveChatMaxWidth(chatMaxWidth);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                  };

                  document.body.style.cursor = 'col-resize';
                  document.body.style.userSelect = 'none';
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="absolute inset-y-0 -inset-x-1" />
              </div>

              <div
                className={`
                  absolute right-0 top-0 bottom-0 w-1 cursor-col-resize
                  hover:bg-sky-500/50 transition-colors duration-200
                  hidden lg:block
                `}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = chatMaxWidth;

                  const handleMouseMove = (e: MouseEvent) => {
                    const delta = e.clientX - startX;
                    handleChatResize(delta);
                  };

                  const handleMouseUp = () => {
                    saveChatMaxWidth(chatMaxWidth);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                  };

                  document.body.style.cursor = 'col-resize';
                  document.body.style.userSelect = 'none';
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="absolute inset-y-0 -inset-x-1" />
              </div>
            </div>
          </div>

        </main>
      </div>


      {/* SYD AGENT PANEL con resize */}
      <SydAgentPanel
        isOpen={sydPanelOpen}
        onClose={() => setSydPanelOpen(false)}
        width={sydPanelWidth}
        onResize={handleSydResize}
        onResizeEnd={() => saveSydPanelWidth(sydPanelWidth)}
      />

      {/* FAB più elegante per Syd - SEMPRE VISIBILE */}
      {!sydPanelOpen && (
        <button
          onClick={() => setSydPanelOpen(true)}
          className="
            fixed bottom-6 right-6 z-30
            bg-gradient-to-r from-sky-500 to-blue-600
            hover:from-sky-600 hover:to-blue-700
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