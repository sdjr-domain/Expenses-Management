import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AssetsPage } from './pages/AssetsPage';
import { AddAssetPage } from './pages/AddAssetPage';
import { EditAssetPage } from './pages/EditAssetPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MainLayout } from './components/MainLayout';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/assets" element={isAuthenticated ? <AssetsPage /> : <Navigate to="/login" />} />
          <Route path="/assets/add" element={isAuthenticated ? <AddAssetPage /> : <Navigate to="/login" />} />
          <Route path="/assets/:id/edit" element={isAuthenticated ? <EditAssetPage /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />} />
          <Route path="/categories" element={isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" />} />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;

