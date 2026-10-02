import { ButtonLink } from '@/components/ui/button';
import { PageHeading } from '@/components/ui/page-heading';
import { StudentsDashboard } from '@/features/teacher/students-dashboard';

export default function TeacherHomePage() {
  return (
    <>
      <PageHeading
        eyebrow="Profesor"
        title="Mis estudiantes"
        description="Consulta y filtra a tus estudiantes por asignatura y polipuntos."
        actions={<ButtonLink href="/profesor/escanear">Escanear estudiante</ButtonLink>}
      />
      <StudentsDashboard />
    </>
  );
}
