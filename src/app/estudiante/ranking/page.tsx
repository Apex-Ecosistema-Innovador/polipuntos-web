import { RequiresConnection } from '@/components/feedback/requires-connection';
import { PageHeading } from '@/components/ui/page-heading';
import { RankingView } from '@/features/student/ranking-view';

export default function StudentRankingPage() {
  return (
    <>
      <PageHeading
        eyebrow="Estudiante"
        title="Ranking"
        description="Compara tus polipuntos con los de tus compañeros de cada asignatura."
      />
      <RequiresConnection feature="El ranking">
        <RankingView />
      </RequiresConnection>
    </>
  );
}
