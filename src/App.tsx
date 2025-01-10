import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import History from './pages/History';
import Settings from './pages/Settings';
import './i18n'; // Make sure to import i18n configuration

function App() {
  const { initialize, user, loading } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const currentLang = localStorage.getItem('i18nextLng') || 'cs';
    if (i18n.isInitialized) {
      i18n.changeLanguage(currentLang);
    }
  }, [i18n.isInitialized]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
