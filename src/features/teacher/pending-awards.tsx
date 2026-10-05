'use client';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/format';
import { useConnectivity } from '../offline/connectivity-context';
import { useSync } from '../offline/sync-context';
import styles from './pending-awards.module.scss';

export function PendingAwards() {
  const { items, syncing, lastError, sync, discard, retry } = useSync();
  const { online } = useConnectivity();
  const hasPending = items.some((item) => item.status === 'pending');

  if (items.length === 0) {
    return (
      <EmptyState
        title="No hay asignaciones pendientes"
        description="Las asignaciones que hagas sin conexión aparecerán aquí hasta que se sincronicen."
        action={<ButtonLink href="/profesor/escanear">Escanear estudiante</ButtonLink>}
      />
    );
  }

  return (
    <div className={styles.list}>
      {lastError && <Alert tone="error">{lastError}</Alert>}
      {hasPending && (
        <div className={styles.toolbar}>
          <Button onClick={() => void sync()} loading={syncing} disabled={!online}>
            Sincronizar ahora
          </Button>
          {!online && (
            <span className={styles.muted}>Se enviarán automáticamente al recuperar la conexión.</span>
          )}
        </div>
      )}
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.id}>
            <Card className={styles.item}>
              <div className={styles.row}>
                <span className={styles.points}>+{item.points}</span>
                <div className={styles.text}>
                  <span>
                    {item.studentName ?? `Estudiante sin verificar (${item.studentId.slice(0, 8)})`}
                  </span>
                  <span className={styles.muted}>
                    {item.offeringLabel} · {formatDateTime(item.occurredAt)}
                    {item.reason ? ` · ${item.reason}` : ''}
                  </span>
                </div>
                <Badge tone={item.status === 'pending' ? 'yellow' : 'danger'}>
                  {item.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                </Badge>
              </div>
              {item.error && <p className={styles.error}>{item.error}</p>}
              <div className={styles.actions}>
                {item.status === 'rejected' && (
                  <Button variant="secondary" onClick={() => void retry(item.id)}>
                    Reintentar
                  </Button>
                )}
                <Button variant="ghost" onClick={() => void discard(item.id)}>
                  Descartar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
