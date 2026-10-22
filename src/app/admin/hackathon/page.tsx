import { RequiresConnection } from '@/components/feedback/requires-connection';
import { RoleGuard } from '@/components/layout/role-guard';
import { PageHeading } from '@/components/ui/page-heading';
import { HackathonRegistrations } from '@/features/admin/hackathon-registrations';

export default function AdminHackathonPage() {
  return (
    <RoleGuard roles={['super_admin']}>
      <PageHeading
        eyebrow="Administración"
        title="Inscritos a la hackathon"
        description="Consulta quién se ha inscrito y los datos que entregó."
      />
      <RequiresConnection feature="El listado de inscritos">
        <HackathonRegistrations />
      </RequiresConnection>
    </RoleGuard>
  );
}
