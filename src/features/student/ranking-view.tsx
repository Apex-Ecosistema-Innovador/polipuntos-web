'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Initials } from '@/components/ui/initials';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@/hooks/use-query';
import { cn } from '@/lib/cn';
import { RANKING_PAGE_SIZE } from '@/lib/pagination';
import { enrollmentService, rankingService } from '@/lib/services';
import styles from './ranking-view.module.scss';

function RankingTable({ offeringId }: { offeringId: string }) {
  const [page, setPage] = useState(1);
  const ranking = useQuery(() => rankingService.page(offeringId, page, RANKING_PAGE_SIZE), [offeringId, page]);

  if (ranking.loading && !ranking.data) return <Spinner />;
  if (!ranking.data) return <Alert tone="error">{ranking.error ?? 'No se pudo cargar el ranking'}</Alert>;

  const { me, entries, total } = ranking.data;

  return (
    <div className={styles.board}>
      {ranking.error && <Alert tone="error">{ranking.error}</Alert>}
      {me && (
        <Card tone="principal" className={styles.me}>
          <span className={styles.meLabel}>Tu posición</span>
          <span className={styles.meRank}>#{me.rank}</span>
          <span className={styles.meText}>
            de {total} · {me.points} polipuntos
          </span>
        </Card>
      )}
      <ol className={styles.entries}>
        {entries.map((entry) => (
          <li
            key={entry.studentId}
            className={cn(styles.entry, entry.isMe && styles.mine)}
            aria-current={entry.isMe ? 'true' : undefined}
          >
            <span className={styles.rank}>
              <span className="visually-hidden">Puesto </span>
              {entry.rank}
            </span>
            <Initials name={entry.fullName} />
            <span className={styles.name}>
              {entry.fullName}
              {entry.isMe && <Badge tone="green">Tú</Badge>}
            </span>
            <span className={styles.points}>
              {entry.points}
              <span className="visually-hidden"> polipuntos</span>
            </span>
          </li>
        ))}
      </ol>
      {total > RANKING_PAGE_SIZE && (
        <Pagination page={page} limit={RANKING_PAGE_SIZE} total={total} onChange={setPage} />
      )}
    </div>
  );
}

export function RankingView() {
  const mine = useQuery(() => enrollmentService.listMine(), []);
  const [selected, setSelected] = useState<string | null>(null);

  if (mine.loading && !mine.data) return <Spinner />;
  if (!mine.data) return <Alert tone="error">{mine.error ?? 'No se pudieron cargar tus asignaturas'}</Alert>;

  if (mine.data.length === 0) {
    return (
      <EmptyState
        title="Aún no cursas asignaturas este semestre"
        description="Carga tu horario para enlazarlas y ver el ranking de tus compañeros."
        action={<ButtonLink href="/estudiante/horario">Cargar horario</ButtonLink>}
      />
    );
  }

  const offeringId = selected ?? mine.data[0].id;

  return (
    <div className={styles.layout}>
      <div className={styles.tabs} role="group" aria-label="Asignatura">
        {mine.data.map((offering) => (
          <Button
            key={offering.id}
            variant={offering.id === offeringId ? 'primary' : 'secondary'}
            aria-pressed={offering.id === offeringId}
            onClick={() => setSelected(offering.id)}
          >
            {offering.courseName}
          </Button>
        ))}
      </div>
      <RankingTable key={offeringId} offeringId={offeringId} />
    </div>
  );
}
