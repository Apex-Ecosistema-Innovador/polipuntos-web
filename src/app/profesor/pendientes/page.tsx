import { PageHeading } from '@/components/ui/page-heading';
import { PendingAwards } from '@/features/teacher/pending-awards';

export default function PendingAwardsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Profesor"
        title="Pendientes de sincronizar"
        description="Asignaciones guardadas en este dispositivo mientras no había conexión."
      />
      <PendingAwards />
    </>
  );
}
