// ============================================================================
// AuthContext — Gerenciamento global de autenticação
// ============================================================================
// O JWT fica em HttpOnly cookie (inacessível ao JS).
// Este contexto apenas guarda os dados do usuário logado,
// obtidos via endpoint /api/auth/me que lê o cookie no backend.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Verificar sessão ao carregar ─────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const data = await api.getMe() as { user: User };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─── Login ────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const data = await api.login(email, password) as { user: User };
    setUser(data.user);
  };

  // ─── Registro ─────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password) as { user: User };
    setUser(data.user);
  };

  // ─── Logout ───────────────────────────────────────────────────────────
  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook seguro — lança erro se usado fora do Provider
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
