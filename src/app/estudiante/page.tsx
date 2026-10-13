import { PageHeading } from '@/components/ui/page-heading';
import { PointsOverview } from '@/features/student/points-overview';
import { ScheduleReminder } from '@/features/student/schedule-reminder';

export default function StudentHomePage() {
  return (
    <>
      <PageHeading
        eyebrow="Estudiante"
        title="Mis polipuntos"
        description="Tu progreso por asignatura, siempre actualizado."
      />
      <ScheduleReminder />
      <PointsOverview />
    </>
  );
}
