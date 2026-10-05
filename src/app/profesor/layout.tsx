import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RoleGuard } from '@/components/layout/role-guard';
import { SyncBanner } from '@/features/offline/sync-banner';
import { SyncProvider } from '@/features/offline/sync-context';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={['teacher']}>
      <SyncProvider>
        <AppShell>
          <SyncBanner />
          {children}
        </AppShell>
      </SyncProvider>
    </RoleGuard>
  );
}
