'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { awardQueue, NewQueuedAward, QueuedAward, SyncOutcome } from '@/lib/offline/award-queue';
import { offlineCache, Roster } from '@/lib/offline/cache';
import { polipointService } from '@/lib/services';
import { errorMessage } from '@/lib/format';
import { useAuth } from '../auth/auth-context';
import { useConnectivity } from './connectivity-context';

interface SyncValue {
  items: QueuedAward[];
  pending: number;
  rejected: number;
  syncing: boolean;
  lastOutcome: SyncOutcome | null;
  lastError: string | null;
  roster: Roster | null;
  enqueue: (input: Omit<NewQueuedAward, 'teacherId'>) => Promise<QueuedAward>;
  sync: () => Promise<void>;
  discard: (id: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
}

const SyncContext = createContext<SyncValue | null>(null);

const RETRY_INTERVAL_MS = 30000;

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user, verified } = useAuth();
  const { online } = useConnectivity();
  const teacherId = user?.id ?? null;
  const [items, setItems] = useState<QueuedAward[]>([]);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<SyncOutcome | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (teacherId) setItems(await awardQueue.list(teacherId).catch(() => []));
  }, [teacherId]);

  const refreshRoster = useCallback(async () => {
    if (!teacherId) return;
    try {
      const fresh = await polipointService.roster();
      setRoster(fresh);
      await offlineCache.roster.set(teacherId, fresh);
    } catch {
      return;
    }
  }, [teacherId]);

  const sync = useCallback(async () => {
    if (!teacherId) return;
    setSyncing(true);
    setLastError(null);
    try {
      const outcome = await awardQueue.sync(teacherId);
      if (outcome.synced + outcome.rejected > 0) setLastOutcome(outcome);
    } catch (error) {
      setLastError(errorMessage(error));
    }
    await reload();
    setSyncing(false);
  }, [teacherId, reload]);

  useEffect(() => {
    if (!teacherId) return;
    let active = true;
    const timer = setTimeout(() => void reload(), 0);
    void offlineCache.roster.get(teacherId).then((cached) => active && cached && setRoster(cached.value));
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [teacherId, reload]);

  const connected = online && verified && Boolean(teacherId);

  useEffect(() => {
    if (!connected) return;
    const timer = setTimeout(() => void sync().then(refreshRoster), 0);
    return () => clearTimeout(timer);
  }, [connected, sync, refreshRoster]);

  const pending = items.filter((item) => item.status === 'pending').length;
  const rejected = items.length - pending;

  useEffect(() => {
    if (!connected || pending === 0) return;
    const timer = setInterval(() => void sync(), RETRY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [connected, pending, sync]);

  const enqueue = useCallback(
    async (input: Omit<NewQueuedAward, 'teacherId'>) => {
      const item = await awardQueue.enqueue({ ...input, teacherId: teacherId! });
      await reload();
      return item;
    },
    [teacherId, reload],
  );

  const discard = useCallback(
    async (id: string) => {
      await awardQueue.discard(id);
      await reload();
    },
    [reload],
  );

  const retry = useCallback(
    async (id: string) => {
      await awardQueue.retry(id);
      await reload();
      if (connected) await sync();
    },
    [reload, connected, sync],
  );

  const value = useMemo(
    () => ({
      items,
      pending,
      rejected,
      syncing,
      lastOutcome,
      lastError,
      roster,
      enqueue,
      sync,
      discard,
      retry,
    }),
    [items, pending, rejected, syncing, lastOutcome, lastError, roster, enqueue, sync, discard, retry],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
}
