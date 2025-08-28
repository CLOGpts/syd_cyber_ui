
import React from 'react';
import UploadCenter from './UploadCenter';
import SessionPanel from './SessionPanel';

const Sidebar: React.FC = () => {
  return (
    <aside className="space-y-6">
      <UploadCenter />
      <SessionPanel />
    </aside>
  );
};

export default Sidebar;
