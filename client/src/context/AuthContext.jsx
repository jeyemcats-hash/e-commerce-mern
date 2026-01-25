import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  loginAdmin: async () => {},
  register: async () => {},
  logout: () => {},
  showLoginPage: false,
  openLoginPage: () => {},
  closeLoginPage: () => {},
  loginMode: 'login',
  loginSource: null,
});

const STORAGE_VERSION = '1'; // Increment this when storage format changes
const USER_STORAGE = {
  scope: 'user',
  tokenKey: 'authToken',
  userKey: 'authUser',
  versionKey: 'authVersion',
};
const ADMIN_STORAGE = {
  scope: 'admin',
  tokenKey: 'adminAuthToken',
  userKey: 'adminAuthUser',
  versionKey: 'adminAuthVersion',
};

const getStorageForPath = (pathname = window.location.pathname) =>
  pathname.startsWith('/admin') ? ADMIN_STORAGE : USER_STORAGE;

const clearStorage = (storage) => {
  localStorage.removeItem(storage.tokenKey);
  localStorage.removeItem(storage.userKey);
  localStorage.removeItem(storage.versionKey);
};

export function AuthProvider({ children }) {
  const storage = getStorageForPath();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedToken = localStorage.getItem(storage.tokenKey);
    const storedUser = localStorage.getItem(storage.userKey);
    const storedVersion = localStorage.getItem(storage.versionKey);
    
    // Invalidate old storage format
    if (storedVersion !== STORAGE_VERSION) {
      clearStorage(storage);
      return false;
    }
    
    return !!(storedToken && storedUser);
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(storage.userKey);
    const storedVersion = localStorage.getItem(storage.versionKey);
    
    // Invalidate old storage format
    if (storedVersion !== STORAGE_VERSION) {
      clearStorage(storage);
      return null;
    }
    
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loginMode, setLoginMode] = useState('login'); // 'login' or 'signup'
  const [loginSource, setLoginSource] = useState(null); // tracks why login page was opened
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Validate token on mount and fetch fresh user data
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(storage.tokenKey);
      const storedUser = localStorage.getItem(storage.userKey);
      const storedVersion = localStorage.getItem(storage.versionKey);
      
      // Ensure we have all required data and correct version
      if (!storedToken || !storedUser || storedVersion !== STORAGE_VERSION) {
        // Clear everything if incomplete or wrong version
        setIsLoggedIn(false);
        setUser(null);
        clearStorage(storage);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Token is invalid (401/403), clear everything
          console.log('Token validation failed - clearing auth');
          setIsLoggedIn(false);
          setUser(null);
          clearStorage(storage);
          return;
        }

        const userData = await response.json();
        
        console.log('Token validated - Server returned user:', userData.name, 'isAdmin:', userData.isAdmin);
        
        // Always update with server data (source of truth)
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem(storage.userKey, JSON.stringify(userData));
      } catch (error) {
        // Network error - don't clear auth, just log
        console.error('Token validation failed (network error):', error);
        // Keep existing state from localStorage
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (parseError) {
          // If we can't parse, clear everything
          setIsLoggedIn(false);
          setUser(null);
          clearStorage(storage);
        }
      }
    };

    validateToken();
  }, [API_URL]);

  const handleAuthSuccess = (payload, targetStorage) => {
    clearStorage(targetStorage);
    
    // Set new state
    setIsLoggedIn(true);
    setUser(payload.user);
    setShowLoginPage(false);
    
    // Set new auth data with version - in specific order
    localStorage.setItem(targetStorage.versionKey, STORAGE_VERSION);
    localStorage.setItem(targetStorage.tokenKey, payload.token);
    localStorage.setItem(targetStorage.userKey, JSON.stringify(payload.user));
    
    // Force a small delay to ensure localStorage writes are complete
    setTimeout(() => {
      console.log('Auth Success - User:', payload.user.name, 'isAdmin:', payload.user.isAdmin);
    }, 0);
  };

  const login = async (email, password) => {
    clearStorage(USER_STORAGE);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    handleAuthSuccess(data, USER_STORAGE);
    return data;
  };

  const loginAdmin = async (email, password) => {
    clearStorage(ADMIN_STORAGE);

    const response = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Admin login failed');
    }

    handleAuthSuccess(data, ADMIN_STORAGE);
    return data;
  };

  const register = async ({ name, email, password }) => {
    clearStorage(USER_STORAGE);

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    handleAuthSuccess(data, USER_STORAGE);
    return data;
  };

  const logout = () => {
    const targetStorage = getStorageForPath();
    setIsLoggedIn(false);
    setUser(null);
    setShowLoginPage(false);
    setLoginMode('login');
    setLoginSource(null);
    
    clearStorage(targetStorage);
  };

  const openLoginPage = (mode = 'login', source = null) => {
    setLoginMode(mode);
    setLoginSource(source);
    setShowLoginPage(true);
  };

  const closeLoginPage = () => {
    setShowLoginPage(false);
    setLoginSource(null);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      login,
      loginAdmin,
      register,
      logout,
      showLoginPage,
      openLoginPage,
      closeLoginPage,
      loginMode,
      loginSource,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
