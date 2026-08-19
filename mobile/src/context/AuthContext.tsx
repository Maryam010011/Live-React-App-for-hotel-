import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types/user';
import { authLogin, authRegister, authGetMe, authLogout } from '../api/authApi';
import { getStoredToken, setStoredToken } from '../utils/storage';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from AsyncStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await getStoredToken();
        if (!storedToken) {
          setLoading(false);
          return;
        }
        // Verify the token is still valid
        const fetchedUser = await authGetMe(storedToken);
        setToken(storedToken);
        setUser(fetchedUser);
      } catch (err) {
        console.warn('⚠️ Token restoration failed, clearing session:', err);
        await setStoredToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authLogin(email, password);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authRegister(name, email, password);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await authLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
