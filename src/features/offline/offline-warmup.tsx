'use client';

import { useEffect } from 'react';
import { offlineCache } from '@/lib/offline/cache';
import { warmServiceWorker } from '@/lib/offline/service-worker';
import { warmTargetsFor } from '@/lib/offline/warm-targets';
import { polipointService } from '@/lib/services';
import { useAuth } from '../auth/auth-context';
import { useConnectivity } from './connectivity-context';

export function OfflineWarmup() {
  const { user, verified } = useAuth();
  const { online } = useConnectivity();
  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (!userId || !role || !verified || !online) return;

    void warmServiceWorker(warmTargetsFor(role)).catch(() => undefined);

    if (role === 'student') {
      polipointService
        .qr()
        .then((token) => offlineCache.qr.set(userId, token))
        .catch(() => undefined);
      polipointService
        .summary()
        .then((summary) => offlineCache.summary.set(userId, summary))
        .catch(() => undefined);
    }
  }, [userId, role, verified, online]);

  return null;
}
