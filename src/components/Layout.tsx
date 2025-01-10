import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store, History, Settings, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuthStore();

  const navigation = [
    { name: t('sales'), href: '/', icon: Store },
    { name: t('inventory'), href: '/inventory', icon: Package },
    { name: t('history'), href: '/history', icon: History },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <div className="w-20 bg-white shadow-lg">
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
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;