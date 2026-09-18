import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { GoldCoinField } from './GoldCoinField';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();


export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // We don't have a dedicated logout API yet, but we can clear the store
      // and rely on the Flask session clearing when we redirect to landing.
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <Link to="/dashboard" className="text-2xl font-display font-bold text-accent">
            Spendly
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link to="/assets" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-medium">Assets</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-medium">Analytics</span>
          </Link>
          <Link to="/categories" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-medium">Categories</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start px-4 py-2">
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">Spendly</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Welcome, {user?.name}</span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
