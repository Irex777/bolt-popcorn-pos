import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, UserPlus, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: string;
}

function Settings() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'cashier',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('i18nextLng', newLanguage);
    i18n.changeLanguage(newLanguage).then(() => {
      window.dispatchEvent(new Event('storage'));
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then add the user role to the `users` table
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: newUser.email,
        role: newUser.role,
      });

      if (dbError) throw dbError;

      toast.success(t('User added successfully'));
      setShowAddUserModal(false);
      setNewUser({ email: '', password: '', role: 'cashier' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user');
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      // Delete from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Delete from `users` table
      const { error: dbError } = await supabase.from('users').delete().eq('id', userId);
      if (dbError) throw dbError;

      toast.success(t('User deleted successfully'));
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Language Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('settings')}
          </h3>
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

      {/* User Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('users')}
            </h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('addUser')}
            </button>
          </div>
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userRole')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{t('addUser')}</h3>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('userRole')}
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="cashier">{t('cashier')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;