import { RequiresConnection } from '@/components/feedback/requires-connection';
import { ButtonLink } from '@/components/ui/button';
import { StudentDetail } from '@/features/teacher/student-detail';

export default function StudentDetailPage() {
  return (
    <RequiresConnection
      feature="El detalle del estudiante"
      actions={
        <ButtonLink href="/profesor/escanear" variant="secondary">
          Ir al escáner
        </ButtonLink>
      }
    >
      <StudentDetail />
    </RequiresConnection>
  );
}
