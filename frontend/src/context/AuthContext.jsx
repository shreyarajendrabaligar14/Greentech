/**
 * AuthContext — provides authentication state and actions app-wide.
 * Stores JWT token + user profile in localStorage for session persistence.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = 'carbontrack_token';
const AUTH_USER_KEY = 'carbontrack_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const persistSession = (tok, usr) => {
    setToken(tok);
    setUser(usr);
    localStorage.setItem(AUTH_TOKEN_KEY, tok);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usr));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await api.login(email, password);
      if (!data || !data.access_token) {
        throw new Error('Invalid login response from server.');
      }
      persistSession(data.access_token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (email, fullName, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await api.register(email, fullName, password);
      if (!data || !data.access_token) {
        throw new Error('Invalid registration response from server.');
      }
      persistSession(data.access_token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated,
      isAdmin,
      authLoading,
      authError,
      setAuthError,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
