'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useConnectivity } from './connectivity-context';
import { useSync } from './sync-context';
import styles from './sync-banner.module.scss';

export function SyncBanner() {
  const { pending, rejected, syncing, lastOutcome, sync } = useSync();
  const { online } = useConnectivity();

  if (pending === 0 && rejected === 0) {
    if (!lastOutcome || lastOutcome.synced === 0) return null;
    return (
      <div className={styles.banner} role="status">
        <span>
          {lastOutcome.synced}{' '}
          {lastOutcome.synced === 1 ? 'asignación sincronizada' : 'asignaciones sincronizadas'} con el
          servidor.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.banner} role="status">
      <div className={styles.text}>
        {pending > 0 && (
          <span>
            <strong>{pending}</strong> {pending === 1 ? 'asignación pendiente' : 'asignaciones pendientes'} de
            sincronizar{online ? '' : '. Se enviarán al recuperar la conexión'}.
          </span>
        )}
        {rejected > 0 && (
          <span className={styles.rejected}>
            <strong>{rejected}</strong> {rejected === 1 ? 'fue rechazada' : 'fueron rechazadas'} por el
            servidor.
          </span>
        )}
      </div>
      <div className={styles.actions}>
        {pending > 0 && online && (
          <Button variant="secondary" onClick={() => void sync()} loading={syncing}>
            Sincronizar ahora
          </Button>
        )}
        <Link href="/profesor/pendientes">Ver pendientes</Link>
      </div>
    </div>
  );
}
