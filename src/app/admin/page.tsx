import { PageHeading } from '@/components/ui/page-heading';
import { AdminPanel } from '@/features/admin/admin-panel';

export default function AdminPage() {
  return (
    <>
      <PageHeading
        eyebrow="Administración"
        title="Panel de administración"
        description="Aprueba profesores y gestiona accesos."
      />
      <AdminPanel />
    </>
  );
}
