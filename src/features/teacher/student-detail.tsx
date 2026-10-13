'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Initials } from '@/components/ui/initials';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { HISTORY_PAGE_SIZE } from '@/lib/pagination';
import { useQuery } from '@/hooks/use-query';
import { accentFor } from '@/lib/accent';
import { cn } from '@/lib/cn';
import { errorMessage, formatCedula, formatDateTime, formatPoints } from '@/lib/format';
import { dashboardService, polipointService } from '@/lib/services';
import styles from './student-detail.module.scss';

export function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const [page, setPage] = useState(1);
  const detail = useQuery(() => dashboardService.detail(studentId, page), [studentId, page]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revoke = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await polipointService.revoke(id, 'Revertido por el profesor');
      setConfirmingId(null);
      await detail.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setBusyId(null);
  };

  if (detail.loading && !detail.data) return <Spinner />;
  if (detail.error || !detail.data)
    return <Alert tone="error">{detail.error ?? 'No se pudo cargar el estudiante'}</Alert>;

  const { student, offerings, history, historyTotal } = detail.data;

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <Initials name={student.fullName} size="lg" />
        <div className={styles.headerText}>
          <h1>{student.fullName}</h1>
          <span className={styles.cedula}>{formatCedula(student.cedula)}</span>
        </div>
        <ButtonLink href="/profesor" variant="secondary">
          Volver
        </ButtonLink>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <ul className={styles.grid}>
        {offerings.map((offering, index) => (
          <li key={offering.offeringId}>
            <Card className={cn(styles.offering, styles[accentFor(index)])}>
              <Badge tone={accentFor(index)}>{offering.courseCode}</Badge>
              <h3>{offering.courseName}</h3>
              <span className={styles.points}>{offering.points}</span>
            </Card>
          </li>
        ))}
      </ul>

      <section aria-labelledby="movements" className={styles.section}>
        <h2 id="movements" className={styles.title}>
          Movimientos
        </h2>
        {history.length === 0 && (
          <p className={styles.muted}>Aún no has asignado polipuntos a este estudiante.</p>
        )}
        <ul className={styles.history}>
          {history.map((item) => (
            <li key={item.id} className={cn(styles.entry, item.revokedAt && styles.revoked)}>
              <span className={styles.entryPoints}>{formatPoints(item.points)}</span>
              <div className={styles.entryText}>
                <span>{item.courseName}</span>
                <span className={styles.muted}>
                  {formatDateTime(item.createdAt)}
                  {item.reason ? ` · ${item.reason}` : ''}
                </span>
              </div>
              {item.revokedAt ? (
                <Badge tone="danger">Revertido</Badge>
              ) : confirmingId === item.id ? (
                <div className={styles.confirm}>
                  <Button variant="danger" loading={busyId === item.id} onClick={() => revoke(item.id)}>
                    Confirmar
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmingId(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmingId(item.id)}>
                  Revertir
                </Button>
              )}
            </li>
          ))}
        </ul>
        {historyTotal > HISTORY_PAGE_SIZE && (
          <Pagination page={page} limit={HISTORY_PAGE_SIZE} total={historyTotal} onChange={setPage} />
        )}
      </section>
    </div>
  );
}
