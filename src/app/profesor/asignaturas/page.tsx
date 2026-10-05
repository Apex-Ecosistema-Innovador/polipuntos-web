import { RequiresConnection } from '@/components/feedback/requires-connection';
import { PageHeading } from '@/components/ui/page-heading';
import { TeacherOfferings } from '@/features/teacher/teacher-offerings';

export default function TeacherOfferingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Profesor"
        title="Mis asignaturas"
        description="Crea las asignaturas que dictas por periodo. Cada una lleva su propio registro de polipuntos."
      />
      <RequiresConnection feature="La gestión de asignaturas">
        <TeacherOfferings />
      </RequiresConnection>
    </>
  );
}
