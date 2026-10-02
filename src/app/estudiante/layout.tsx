import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RoleGuard } from '@/components/layout/role-guard';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={['student']}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
