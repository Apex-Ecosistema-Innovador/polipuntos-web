import { PageHeading } from '@/components/ui/page-heading';
import { AwardFlow } from '@/features/teacher/award-flow';

export default function TeacherScanPage() {
  return (
    <>
      <PageHeading
        eyebrow="Profesor"
        title="Escanear estudiante"
        description="Escanea el QR, elige la asignatura y asigna los polipuntos."
      />
      <AwardFlow />
    </>
  );
}
