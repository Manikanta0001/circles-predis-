'use client';

import React from 'react';
import RedesignedSidebar from './RedesignedSidebar';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
      <RedesignedSidebar>
        {children}
      </RedesignedSidebar>
    </div>
  );
};

export default ModernLayout;
