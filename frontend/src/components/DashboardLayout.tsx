import React from 'react';
import { Outlet } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
