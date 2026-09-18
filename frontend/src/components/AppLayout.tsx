import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import CoinGlide from './CoinGlide';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-paper dark:bg-zinc-900 sticky top-0 z-50 backdrop-blur-md bg-opacity-80 transition-colors duration-300">
      <Link to="/" className="text-2xl font-display font-bold text-ink dark:text-paper">
        Spendly<span className="text-accent">.</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors dark:text-slate-300">Dashboard</Link>
        <Link to="/assets" className="text-sm font-medium hover:text-accent transition-colors dark:text-slate-300">Assets</Link>
        <Link to="/analytics" className="text-sm font-medium hover:text-accent transition-colors dark:text-slate-300">Analytics</Link>
        <Link to="/profile" className="text-sm font-medium hover:text-accent transition-colors dark:text-slate-300">Profile</Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-zinc-950 transition-colors duration-300">
      <CoinGlide />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-zinc-800">
        © {new Date().getFullYear()} Spendly. Premium Financial Tracking.
      </footer>
    </div>
  );
};

export default AppLayout;
