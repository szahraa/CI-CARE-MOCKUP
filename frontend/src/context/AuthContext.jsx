import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = '/api';
const getToken = () => localStorage.getItem('ci-care-token');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('ci-care-user');
    if (!token) {
      setLoading(false);
      return;
    }
    // Check for stored user first (simple login)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ci-care-user');
        localStorage.removeItem('ci-care-token');
      }
      setLoading(false);
      return;
    }
    // Fallback to API check
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => localStorage.removeItem('ci-care-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // Simple login - accept any email/password combination
    const fakeUser = {
      id: 1,
      email: email,
      name: email.split('@')[0] || 'User',
    };
    localStorage.setItem('ci-care-token', 'fake-token-' + Date.now());
    localStorage.setItem('ci-care-user', JSON.stringify(fakeUser));
    setUser(fakeUser);
    return fakeUser;
  };

  const logout = () => {
    localStorage.removeItem('ci-care-token');
    localStorage.removeItem('ci-care-user');
    setUser(null);
  };

  const authFetch = (path, options = {}) => {
    const token = getToken();
    return fetch(`${API}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
