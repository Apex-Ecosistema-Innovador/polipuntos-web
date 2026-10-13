import { RequiresConnection } from '@/components/feedback/requires-connection';
import { PageHeading } from '@/components/ui/page-heading';
import { ScheduleUpload } from '@/features/student/schedule-upload';

export default function StudentSchedulePage() {
  return (
    <>
      <PageHeading
        eyebrow="Estudiante"
        title="Mi horario"
        description="Cada semestre tus asignaturas se reinician. Carga tu horario para enlazarlas de nuevo."
      />
      <RequiresConnection feature="La carga del horario">
        <ScheduleUpload />
      </RequiresConnection>
    </>
  );
}
