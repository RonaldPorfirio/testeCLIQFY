import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

type User = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'viewer';
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.ok) {
            const data = await res.json();
            setUser(data.user ?? null);
          }
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res.ok) return false;

      const data = await res.json();
      const accessToken = data.accessToken ?? data.token;
      if (accessToken) await AsyncStorage.setItem('accessToken', accessToken);
      if (data.refreshToken) await AsyncStorage.setItem('refreshToken', data.refreshToken);

      setUser(data.user ?? null);
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
