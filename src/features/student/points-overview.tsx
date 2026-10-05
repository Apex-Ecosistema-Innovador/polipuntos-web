'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { OfflineNotice } from '@/components/feedback/offline-notice';
import { useAuth } from '@/features/auth/auth-context';
import { useQuery } from '@/hooks/use-query';
import { NetworkError } from '@/lib/api-client';
import { offlineCache } from '@/lib/offline/cache';
import { useConnectivity } from '../offline/connectivity-context';
import { StudentSummary } from '@/types/api';
import { accentFor } from '@/lib/accent';
import { formatDateTime } from '@/lib/format';
import { polipointService } from '@/lib/services';
import { cn } from '@/lib/cn';
import styles from './points-overview.module.scss';

interface Loaded {
  summary: StudentSummary;
  savedAt: string | null;
}

export function PointsOverview() {
  const { user } = useAuth();
  const { online } = useConnectivity();
  const userId = user?.id;

  const { data, loading, error } = useQuery<Loaded | null>(async () => {
    if (!userId) return null;
    try {
      const summary = await polipointService.summary();
      await offlineCache.summary.set(userId, summary);
      return { summary, savedAt: null };
    } catch (caught) {
      const cached = caught instanceof NetworkError ? await offlineCache.summary.get(userId) : null;
      if (!cached) throw caught;
      return { summary: cached.value, savedAt: cached.savedAt };
    }
  }, [userId, online]);

  if (loading && !data) return <Spinner />;
  if (!data) {
    if (!online) {
      return (
        <OfflineNotice description="Tus polipuntos se consultan en línea. Conéctate a la red para verlos." />
      );
    }
    return <Alert tone="error">{error ?? 'No se pudo cargar tu resumen'}</Alert>;
  }

  if (data.savedAt) {
    return (
      <div className={styles.overview}>
        <Alert tone="info">
          Sin conexión: este es el último total conocido ({formatDateTime(data.savedAt)}) y puede estar
          desactualizado. Conéctate a la red para sincronizar.
        </Alert>
        <Card tone="principal" className={styles.total}>
          <span className={styles.totalLabel}>Último total conocido</span>
          <span className={styles.totalValue}>{data.summary.total}</span>
          <Badge tone="yellow">Desactualizado</Badge>
        </Card>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className={styles.overview}>
      <Card tone="principal" className={styles.total}>
        <span className={styles.totalLabel}>Total de polipuntos</span>
        <span className={styles.totalValue}>{summary.total}</span>
      </Card>

      <section aria-labelledby="by-offering" className={styles.section}>
        <h2 id="by-offering" className={styles.sectionTitle}>
          Por asignatura
        </h2>
        {summary.offerings.length === 0 ? (
          <EmptyState
            title="Aún no cursas asignaturas"
            description="Inscríbete para que tus profesores puedan asignarte polipuntos."
            action={<ButtonLink href="/estudiante/asignaturas">Ver asignaturas</ButtonLink>}
          />
        ) : (
          <ul className={styles.grid}>
            {summary.offerings.map((offering, index) => (
              <li key={offering.offeringId}>
                <Card interactive className={cn(styles.offering, styles[accentFor(index)])}>
                  <Badge tone={accentFor(index)}>{offering.courseCode}</Badge>
                  <h3>{offering.courseName}</h3>
                  <p className={styles.teacher}>
                    {offering.teacherName} · {offering.term}
                  </p>
                  <span className={styles.points}>{offering.points}</span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history" className={styles.section}>
        <h2 id="history" className={styles.sectionTitle}>
          Historial
        </h2>
        {summary.history.length === 0 ? (
          <p className={styles.muted}>Todavía no tienes polipuntos asignados.</p>
        ) : (
          <ul className={styles.history}>
            {summary.history.map((item) => (
              <li key={item.id} className={cn(styles.entry, item.revokedAt && styles.revoked)}>
                <span className={styles.entryPoints}>+{item.points}</span>
                <div className={styles.entryText}>
                  <span>
                    {item.courseName} · {item.teacherName}
                  </span>
                  <span className={styles.muted}>
                    {formatDateTime(item.createdAt)}
                    {item.reason ? ` · ${item.reason}` : ''}
                  </span>
                </div>
                {item.revokedAt && <Badge tone="danger">Revertido</Badge>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
