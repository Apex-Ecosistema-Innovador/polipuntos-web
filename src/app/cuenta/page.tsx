import { RequiresConnection } from '@/components/feedback/requires-connection';
import { PageHeading } from '@/components/ui/page-heading';
import { AccountOverview } from '@/features/account/account-overview';

export default function AccountPage() {
  return (
    <>
      <PageHeading eyebrow="Cuenta" title="Mi cuenta" description="Tus datos y la seguridad de tu acceso." />
      <RequiresConnection feature="La gestión de tu cuenta">
        <AccountOverview />
      </RequiresConnection>
    </>
  );
}
