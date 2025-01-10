import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function Settings() {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('i18nextLng', newLanguage);
    i18n.changeLanguage(newLanguage).then(() => {
      window.dispatchEvent(new Event('storage'));
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('settings')}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('language')}
                </div>
              </label>
              <select
                value={localStorage.getItem('i18nextLng') || 'cs'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="cs">Čeština</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;