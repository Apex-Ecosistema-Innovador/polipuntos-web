'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { useQuery } from '@/hooks/use-query';
import { scheduleService } from '@/lib/services';

export function ScheduleReminder() {
  const { data } = useQuery(() => scheduleService.current().catch(() => null), []);

  if (!data || data.uploaded) return null;

  return (
    <Alert tone="info">
      Empezó un nuevo periodo ({data.term}). <Link href="/estudiante/horario">Carga tu horario</Link> para enlazar
      tus asignaturas de este semestre.
    </Alert>
  );
}
