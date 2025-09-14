import React from 'react';
import UploadCenter from './UploadCenter';
import SessionPanel from './SessionPanel';
import { Upload, BarChart3, Shield, Brain, FileText, Video, Map } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

interface SidebarProps {
  onOpenSydAgent?: () => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenSydAgent, isCollapsed = false }) => {
  const setShowVideoPresentation = useAppStore((state) => state.setShowVideoPresentation);
  const setShowRiskReport = useAppStore((state) => state.setShowRiskReport);
  // Quando collapsed, mostra solo icone con tooltip
  if (isCollapsed) {
    return (
      <aside className="h-full flex flex-col py-4 gap-2">
        {/* Upload Icon */}
        <div className="group relative flex justify-center">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Upload size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Centro Caricamenti
          </span>
        </div>

        {/* ATECO Icon */}
        <div className="group relative flex justify-center">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <BarChart3 size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Analizza ATECO
          </span>
        </div>

        {/* Risk Management Icon */}
        <div className="group relative flex justify-center">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Shield size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Risk Management
          </span>
        </div>

        {/* Syd Agent Icon */}
        <div className="group relative flex justify-center">
          <button
            onClick={onOpenSydAgent}
            className="p-3 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
          >
            <Brain size={20} className="text-sky-500" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Syd Agent
          </span>
        </div>

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-gray-200 dark:border-gray-700" />

        {/* Report Icon */}
        <div className="group relative flex justify-center">
          <button
            onClick={() => setShowRiskReport(true)}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FileText size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Risk Report
          </span>
        </div>

        {/* Video Icon - Apre la presentazione al centro */}
        <div className="group relative flex justify-center">
          <button
            onClick={() => setShowVideoPresentation(true)}
            className="p-3 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Video size={20} className="text-blue-500" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Video Presentazione
          </span>
        </div>

        {/* Tour Guidato Icon */}
        <div className="group relative flex justify-center">
          <button
            onClick={() => {
              if ((window as any).startGuidedTour) {
                (window as any).startGuidedTour();
              }
            }}
            className="p-3 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
          >
            <Map size={20} className="text-sky-500" />
          </button>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Tour Guidato
          </span>
        </div>
      </aside>
    );
  }

  // Layout normale quando expanded
  return (
    <aside className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Upload Center - altezza fissa e compatta */}
      <div className="flex-shrink-0">
        <UploadCenter />
      </div>

      {/* Session Panel - occupa lo spazio rimanente con scroll se necessario */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <SessionPanel />
      </div>
    </aside>
  );
};

export default Sidebar;