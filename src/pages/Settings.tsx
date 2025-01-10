import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

interface Settings {
  language: string;
  currency: string;
  googleSheetUrl?: string;
}

function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<Settings>({
    language: localStorage.getItem('i18nextLng') || 'cs',
    currency: 'CZK',
    googleSheetUrl: '',
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('key', 'preferences')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settingsData = data.value as Settings;
        setSettings(settingsData);
        // Don't change language here, only on explicit user action
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Update local state
    setSettings((prev) => ({ ...prev, language: newLanguage }));

    // Update i18next and localStorage
    localStorage.setItem('i18nextLng', newLanguage);
    i18n.changeLanguage(newLanguage).then(() => {
      // Force a re-render of all components using translations
      window.dispatchEvent(new Event('storage'));
    });

    // Save to database if user is logged in
    if (user) {
      const newSettings = { ...settings, language: newLanguage };
      supabase
        .from('settings')
        .upsert({
          key: 'preferences',
          value: newSettings,
          user_id: user.id,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving language preference:', error);
            toast.error('Failed to save language preference');
          }
        });
    }
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('Must be logged in to save settings');
      return;
    }

    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'preferences',
        value: settings,
        user_id: user.id,
      });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
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
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="cs">Čeština</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheet URL
              </label>
              <input
                type="url"
                value={settings.googleSheetUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, googleSheetUrl: e.target.value })
                }
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
          <button
            onClick={saveSettings}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
