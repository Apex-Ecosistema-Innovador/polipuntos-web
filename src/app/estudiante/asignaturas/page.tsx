import { RequiresConnection } from '@/components/feedback/requires-connection';
import { PageHeading } from '@/components/ui/page-heading';
import { MyOfferings } from '@/features/student/my-offerings';

export default function StudentOfferingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Estudiante"
        title="Asignaturas"
        description="Puedes cursar varias asignaturas, incluso con el mismo profesor. Cada profesor lleva tus polipuntos por separado."
      />
      <RequiresConnection feature="La gestión de asignaturas">
        <MyOfferings />
      </RequiresConnection>
    </>
  );
}
