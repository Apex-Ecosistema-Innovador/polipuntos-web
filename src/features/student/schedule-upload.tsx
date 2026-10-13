'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/format';
import { enrollmentService, scheduleService } from '@/lib/services';
import { scheduleCopy } from '@/content/schedule';
import type { ScheduleItem, ScheduleOverview } from '@/types/api';
import styles from './schedule-upload.module.scss';

const MAX_BYTES = 2 * 1024 * 1024;

const fileProblem = (file: File) => {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return scheduleCopy.notPdf;
  if (file.size > MAX_BYTES) return scheduleCopy.tooLarge;
  return null;
};

function ScheduleRow({
  item,
  busy,
  onChoose,
}: {
  item: ScheduleItem;
  busy: boolean;
  onChoose: (offeringId: string) => void;
}) {
  return (
    <li>
      <Card className={styles.item}>
        <div className={styles.itemHead}>
          <Badge tone="yellow">{item.courseCode}</Badge>
          <strong>{item.courseName}</strong>
          {item.status === 'linked' && <Badge tone="green">Enlazada</Badge>}
          {item.status === 'unavailable' && <Badge>Sin profesor aún</Badge>}
        </div>
        {item.status === 'unavailable' && <p className={styles.muted}>{scheduleCopy.unavailable}</p>}
        {item.status === 'choose' && (
          <div className={styles.options}>
            <p className={styles.muted}>{scheduleCopy.choose}</p>
            <ul className={styles.optionList}>
              {item.options.map((option) => (
                <li key={option.offeringId}>
                  <Button variant="secondary" disabled={busy} onClick={() => onChoose(option.offeringId)}>
                    {option.teacher.fullName}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </li>
  );
}

export function ScheduleUpload() {
  const current = useQuery(() => scheduleService.current(), []);
  const input = useRef<HTMLInputElement>(null);
  const [overview, setOverview] = useState<ScheduleOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shown = overview ?? current.data;

  const run = async (action: () => Promise<ScheduleOverview>) => {
    setBusy(true);
    setError(null);
    try {
      setOverview(await action());
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setBusy(false);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = fileProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    await run(() => scheduleService.upload(file));
  };

  const choose = (offeringId: string) =>
    run(async () => {
      await enrollmentService.enroll(offeringId);
      return scheduleService.current();
    });

  if (current.loading && !shown) return <Spinner />;
  if (!shown) return <Alert tone="error">{current.error ?? scheduleCopy.loadFailed}</Alert>;

  const pending = shown.items.some((item) => item.status !== 'linked');

  return (
    <div className={styles.layout}>
      {error && <Alert tone="error">{error}</Alert>}

      <Card className={styles.upload}>
        <div className={styles.uploadText}>
          <h2 className={styles.title}>Horario del periodo {shown.term}</h2>
          <p className={styles.muted}>{shown.uploaded ? scheduleCopy.uploaded : scheduleCopy.intro}</p>
          <p className={styles.muted}>{scheduleCopy.privacy}</p>
        </div>
        <input
          ref={input}
          id="schedule-file"
          className="visually-hidden"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFile}
          disabled={busy}
        />
        <div className={styles.actions}>
          <Button loading={busy} onClick={() => input.current?.click()}>
            {shown.uploaded ? 'Cargar de nuevo' : 'Cargar horario en PDF'}
          </Button>
          {shown.uploaded && pending && (
            <Button variant="secondary" disabled={busy} onClick={() => run(() => scheduleService.sync())}>
              Buscar de nuevo
            </Button>
          )}
        </div>
      </Card>

      {shown.items.length > 0 && (
        <section aria-labelledby="schedule-items" className={styles.section}>
          <h2 id="schedule-items" className={styles.title}>
            Asignaturas de tu horario
          </h2>
          <ul className={styles.list}>
            {shown.items.map((item) => (
              <ScheduleRow key={item.courseCode} item={item} busy={busy} onChoose={choose} />
            ))}
          </ul>
        </section>
      )}

      <div className={styles.actions}>
        <ButtonLink href="/estudiante" variant={shown.uploaded ? 'primary' : 'secondary'}>
          {shown.uploaded ? 'Ir a mis polipuntos' : 'Omitir por ahora'}
        </ButtonLink>
        <ButtonLink href="/estudiante/asignaturas" variant="ghost">
          Inscribirme manualmente
        </ButtonLink>
      </div>
    </div>
  );
}
