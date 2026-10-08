'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NetworkError, refreshSession, tokenStore } from '@/lib/api-client';
import { offlineCache } from '@/lib/offline/cache';
import { sessionCookie } from '@/lib/session-cookie';
import { authService } from '@/lib/services';
import { User } from '@/types/api';
import { useConnectivity } from '../offline/connectivity-context';
import type { AuthContextValue, AuthStatus, RestoredSession } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

async function restore(): Promise<RestoredSession> {
  try {
    if (!(await refreshSession())) return { kind: 'anonymous' };
    return { kind: 'verified', user: (await authService.me()).payload.user };
  } catch (error) {
    if (!(error instanceof NetworkError)) return { kind: 'anonymous' };
    const cached = await offlineCache.session.get();
    return cached ? { kind: 'cached', user: cached.value } : { kind: 'anonymous' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { online } = useConnectivity();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [verified, setVerified] = useState(false);
  const [signedOutByUser, setSignedOutByUser] = useState(false);

  const establish = useCallback((nextUser: User) => {
    setUser(nextUser);
    setStatus('authenticated');
    setVerified(true);
    setSignedOutByUser(false);
    sessionCookie.set(nextUser.role);
    void offlineCache.session.set(nextUser);
  }, []);

  const apply = useCallback(
    (result: RestoredSession) => {
      if (result.kind === 'verified') {
        establish(result.user);
        return;
      }
      if (result.kind === 'cached') {
        setUser(result.user);
        setStatus('authenticated');
        setVerified(false);
        return;
      }
      sessionCookie.clear();
      void offlineCache.session.clear();
      setUser(null);
      setStatus('anonymous');
      setVerified(false);
    },
    [establish],
  );

  const needsRestore = status === 'loading' || (status === 'authenticated' && !verified && online);

  useEffect(() => {
    if (!needsRestore) return;
    let active = true;
    void restore().then((result) => active && apply(result));
    return () => {
      active = false;
    };
  }, [needsRestore, apply]);

  const completeSession = useCallback(
    (nextUser: User, accessToken: string) => {
      tokenStore.set(accessToken);
      establish(nextUser);
    },
    [establish],
  );

  const signIn = useCallback(
    async (cedula: string, password: string) => {
      const { payload } = await authService.login(cedula, password);
      completeSession(payload.user, payload.accessToken!);
      return payload.user;
    },
    [completeSession],
  );

  const signOut = useCallback(async () => {
    tokenStore.revoke();
    sessionCookie.clear();
    await authService.logout().catch(() => undefined);
    if (user) await offlineCache.clearUserData(user.id);
    setSignedOutByUser(true);
    setUser(null);
    setStatus('anonymous');
    setVerified(false);
  }, [user]);

  const value = useMemo(
    () => ({ user, status, verified, signedOutByUser, signIn, completeSession, signOut }),
    [user, status, verified, signedOutByUser, signIn, completeSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
