import { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import splineScene from '../assets/spline/reactive_background.spline';
import { useAuth } from '../context/AuthContext.jsx';

function AdminLoginPage() {
  const { loginAdmin, user, isLoggedIn } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect normal users away from admin login
  useEffect(() => {
    if (isLoggedIn && !user?.isAdmin) {
      console.log('Non-admin logged in on admin-login - redirecting to home');
      window.location.href = '/';
    }
  }, [isLoggedIn, user?.isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(credentials.email, credentials.password);
      // Redirect to admin dashboard on successful login
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in as admin, redirect to dashboard
  if (isLoggedIn && user?.isAdmin) {
    window.location.href = '/admin';
    return null;
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-8 overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-auto"
        style={{ width: '100vw', height: '100vh' }}
        onWheel={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="w-full h-full">
          <Spline scene={splineScene} className="w-full h-full" />
        </div>
      </div>
      <div className="absolute inset-0 bg-neutral-950/50 z-0 pointer-events-none"></div>
      <div className="w-full max-w-md relative z-10 pointer-events-auto">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-40 sm:w-72 h-40 sm:h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 sm:w-72 h-40 sm:h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

        <div className="relative z-10 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-black to-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl sm:text-2xl">H</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Portal</h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-2">Sign in to manage products</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-neutral-300">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-sm sm:text-base text-neutral-100"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-neutral-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-sm sm:text-base text-neutral-100"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-xs sm:text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 px-4 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-neutral-400 text-xs mt-6">
            Only authorized admins can access this portal
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
