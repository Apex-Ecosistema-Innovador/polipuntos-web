'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@/hooks/use-query';
import { accentFor } from '@/lib/accent';
import { formatDateTime } from '@/lib/format';
import { polipointService } from '@/lib/services';
import { cn } from '@/lib/cn';
import styles from './points-overview.module.scss';

export function PointsOverview() {
  const { data, loading, error } = useQuery(() => polipointService.summary(), []);

  if (loading) return <Spinner />;
  if (error || !data) return <Alert tone="error">{error ?? 'No se pudo cargar tu resumen'}</Alert>;

  return (
    <div className={styles.overview}>
      <Card tone="principal" className={styles.total}>
        <span className={styles.totalLabel}>Total de polipuntos</span>
        <span className={styles.totalValue}>{data.total}</span>
      </Card>

      <section aria-labelledby="by-offering" className={styles.section}>
        <h2 id="by-offering" className={styles.sectionTitle}>
          Por asignatura
        </h2>
        {data.offerings.length === 0 ? (
          <EmptyState
            title="Aún no cursas asignaturas"
            description="Inscríbete para que tus profesores puedan asignarte polipuntos."
            action={<ButtonLink href="/estudiante/asignaturas">Ver asignaturas</ButtonLink>}
          />
        ) : (
          <ul className={styles.grid}>
            {data.offerings.map((offering, index) => (
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
        {data.history.length === 0 ? (
          <p className={styles.muted}>Todavía no tienes polipuntos asignados.</p>
        ) : (
          <ul className={styles.history}>
            {data.history.map((item) => (
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
