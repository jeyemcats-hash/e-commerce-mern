import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const THEME_KEY = 'theme';

function UserSettings() {
  const { user, isLoggedIn, openLoginPage, logout } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setProfile({ name: user?.name || '', email: user?.email || '' });
  }, [user]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('theme-dark', storedTheme === 'dark');
  }, []);

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle('theme-dark', next === 'dark');
  };

  const handleProfileSave = async () => {
    setProfileMsg('');
    if (!isLoggedIn) {
      openLoginPage('login', 'settings');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = user?.id || user?._id;
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg('');
    if (!isLoggedIn) {
      openLoginPage('login', 'settings');
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMsg('Please fill in all fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      setPasswordMsg('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg('');
    if (!isLoggedIn) {
      openLoginPage('login', 'settings');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }
      setDeleteMsg('Account deleted.');
      logout();
      window.location.href = '/';
    } catch (err) {
      setDeleteMsg(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-white rounded-lg mt-4 md:mt-6 shadow-sm border border-neutral-200">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-normal text-neutral-950">Settings</h2>
        <p className="text-neutral-600 text-sm mt-1 font-normal">Manage your profile and preferences</p>
      </div>

      {!isLoggedIn && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
          <p className="text-neutral-700 mb-4 font-normal">Please log in to access settings.</p>
          <button
            onClick={() => openLoginPage('login', 'settings')}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition font-normal text-sm"
          >
            Log in
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div className="space-y-0">
          <div className="mb-6 pb-6 border-b border-neutral-200">
            <h3 className="text-lg font-normal text-neutral-950">Profile</h3>
            <p className="text-neutral-600 text-sm mt-1 font-normal">Update your name and email</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="text"
                placeholder="Full name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-black font-normal"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-black font-normal"
              />
            </div>
            {profileMsg && <p className="text-sm mt-3 text-neutral-700 font-normal">{profileMsg}</p>}
            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition text-sm font-normal disabled:opacity-60"
            >
              Save Profile
            </button>
          </div>

          <div className="mb-6 pb-6 border-b border-neutral-200">
            <h3 className="text-lg font-normal text-neutral-950">Customize</h3>
            <p className="text-neutral-600 text-sm mt-1 font-normal">Switch between light and dark mode</p>
            <button
              onClick={handleThemeToggle}
              className="mt-4 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition text-sm font-normal"
            >
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>

          <div className="mb-6 pb-6 border-b border-neutral-200">
            <h3 className="text-lg font-normal text-neutral-950">Security</h3>
            <p className="text-neutral-600 text-sm mt-1 font-normal">Change your password</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-black font-normal"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-black font-normal"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-black font-normal"
              />
            </div>
            {passwordMsg && <p className="text-sm mt-3 text-neutral-700 font-normal">{passwordMsg}</p>}
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition text-sm font-normal disabled:opacity-60"
            >
              Update Password
            </button>
          </div>

          <div>
            <h3 className="text-lg font-normal text-neutral-950">Delete Account</h3>
            <p className="text-neutral-600 text-sm mt-1 font-normal">This action cannot be undone.</p>
            {deleteMsg && <p className="text-sm mt-3 text-neutral-700 font-normal">{deleteMsg}</p>}
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition text-sm font-normal disabled:opacity-60"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;
