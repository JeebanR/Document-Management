import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResult } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setSession: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser());

  function setSession(result: AuthResult) {
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
