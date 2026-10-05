import { Suspense } from 'react';
import { PageHeading } from '@/components/ui/page-heading';
import { AwardFlow } from '@/features/teacher/award-flow';

export default function TeacherScanPage() {
  return (
    <>
      <PageHeading
        eyebrow="Profesor"
        title="Asignar polipuntos"
        description="Escanea el QR o busca al estudiante, elige la asignatura y asigna los polipuntos."
      />
      <Suspense>
        <AwardFlow />
      </Suspense>
    </>
  );
}
