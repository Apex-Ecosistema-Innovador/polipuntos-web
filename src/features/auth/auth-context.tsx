'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { refreshSession, tokenStore } from '@/lib/api-client';
import { authService } from '@/lib/services';
import { User } from '@/types/api';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: (cedula: string, password: string) => Promise<User>;
  completeSession: (user: User, accessToken: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    refreshSession()
      .then(async (token) => {
        if (!token) return null;
        return (await authService.me()).payload.user;
      })
      .catch(() => null)
      .then((current) => {
        if (!active) return;
        setUser(current);
        setStatus(current ? 'authenticated' : 'anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const completeSession = useCallback((nextUser: User, accessToken: string) => {
    tokenStore.set(accessToken);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(
    async (cedula: string, password: string) => {
      const { payload } = await authService.login(cedula, password);
      completeSession(payload.user, payload.accessToken!);
      return payload.user;
    },
    [completeSession],
  );

  const signOut = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    tokenStore.set(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, completeSession, signOut }),
    [user, status, signIn, completeSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
