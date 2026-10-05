'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { healthUrl, networkEvents } from '@/lib/api-client';

interface ConnectivityValue {
  online: boolean;
  known: boolean;
  checking: boolean;
  recheck: () => Promise<boolean>;
}

const ConnectivityContext = createContext<ConnectivityValue | null>(null);

const PROBE_TIMEOUT_MS = 4000;
const OFFLINE_POLL_MS = 10000;

async function probe(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(healthUrl, { cache: 'no-store', signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [known, setKnown] = useState(false);
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  const recheck = useCallback(async () => {
    setChecking(true);
    const reachable = await probe();
    if (mounted.current) {
      setOnline(reachable);
      setKnown(true);
      setChecking(false);
    }
    return reachable;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initial = setTimeout(() => void recheck(), 0);
    const handleOffline = () => setOnline(false);
    const handleOnline = () => void recheck();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void recheck();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    const unsubscribe = networkEvents.subscribe(setOnline);

    return () => {
      mounted.current = false;
      clearTimeout(initial);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
    };
  }, [recheck]);

  useEffect(() => {
    if (online) return;
    const timer = setInterval(() => void recheck(), OFFLINE_POLL_MS);
    return () => clearInterval(timer);
  }, [online, recheck]);

  const value = useMemo(() => ({ online, known, checking, recheck }), [online, known, checking, recheck]);

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return context;
}
