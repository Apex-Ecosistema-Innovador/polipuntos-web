'use client';

import { useMemo, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/format';
import { enrollmentService, offeringService } from '@/lib/services';
import { OfferingAddSelect } from './offering-select';
import styles from './my-offerings.module.scss';

export function MyOfferings() {
  const mine = useQuery(() => enrollmentService.listMine(), []);
  const catalog = useQuery(() => offeringService.listPublic(), []);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const enrolledIds = useMemo(() => (mine.data ?? []).map((offering) => offering.id), [mine.data]);

  const run = async (offeringId: string, action: () => Promise<unknown>) => {
    setBusyId(offeringId);
    setError(null);
    try {
      await action();
      await mine.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setBusyId(null);
  };

  if (mine.loading || catalog.loading) return <Spinner />;

  return (
    <div className={styles.layout}>
      {(error || mine.error) && <Alert tone="error">{error ?? mine.error}</Alert>}

      <section aria-labelledby="enrolled" className={styles.section}>
        <h2 id="enrolled" className={styles.title}>
          Mis asignaturas
        </h2>
        {enrolledIds.length === 0 ? (
          <EmptyState
            title="Sin asignaturas"
            description="Elige una de la lista para comenzar a acumular polipuntos."
          />
        ) : (
          <ul className={styles.list}>
            {mine.data!.map((offering) => (
              <li key={offering.id}>
                <Card className={styles.row}>
                  <div className={styles.info}>
                    <Badge tone="yellow">{offering.courseCode}</Badge>
                    <strong>{offering.courseName}</strong>
                    <span className={styles.meta}>
                      {offering.teacher.fullName} · {offering.term}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    loading={busyId === offering.id}
                    onClick={() => run(offering.id, () => enrollmentService.unenroll(offering.id))}
                  >
                    Salir
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="catalog" className={styles.section}>
        <h2 id="catalog" className={styles.title}>
          Agregar asignatura
        </h2>
        <OfferingAddSelect
          offerings={(catalog.data ?? []).filter((offering) => !enrolledIds.includes(offering.id))}
          disabled={busyId !== null}
          onAdd={(id) => run(id, () => enrollmentService.enroll(id))}
        />
      </section>
    </div>
  );
}
