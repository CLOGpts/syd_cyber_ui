import React from 'react';
import UploadCenter from './UploadCenter';
import SessionPanel from './SessionPanel';

const Sidebar: React.FC = () => {
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