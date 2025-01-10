import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store, History, Settings, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: t('sales'), href: '/', icon: Store },
    { name: t('inventory'), href: '/inventory', icon: Package },
    { name: t('history'), href: '/history', icon: History },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-lg font-semibold">
            {navigation.find(item => item.href === location.pathname)?.name || t('sales')}
          </h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)] lg:h-screen">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-20 bg-white shadow-lg">
          <div className="h-full flex flex-col justify-between py-4">
            <nav className="space-y-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center p-2 text-sm font-medium rounded-lg ${
                      location.pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="mt-1">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => signOut()}
              className="flex flex-col items-center p-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <LogOut className="h-6 w-6" />
              <span className="mt-1">{t('logout')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
            <div className="bg-white w-64 h-full">
              <div className="flex flex-col h-full">
                <nav className="flex-1 pt-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium ${
                          location.pathname === item.href
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;