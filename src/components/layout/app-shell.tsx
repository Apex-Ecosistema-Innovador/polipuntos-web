'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { navigationByRole, roleLabels } from '@/content/navigation';
import { cn } from '@/lib/cn';
import { ConnectionBanner } from '../feedback/connection-banner';
import { OfflineWarmup } from '@/features/offline/offline-warmup';
import { useConnectivity } from '@/features/offline/connectivity-context';
import { Button } from '../ui/button';
import { Initials } from '../ui/initials';
import { Badge } from '../ui/badge';
import { Container } from './container';
import { Wordmark } from './wordmark';
import styles from './app-shell.module.scss';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { online } = useConnectivity();

  if (!user) return null;

  const items = navigationByRole[user.role];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className={styles.shell}>
      <OfflineWarmup />
      <header className={styles.header}>
        <Container className={styles.bar}>
          <Wordmark href={items[0].href} />
          <div className={styles.account}>
            <div className={styles.identity}>
              <Initials name={user.fullName} />
              <div className={styles.names}>
                <span className={styles.fullName}>{user.fullName}</span>
                <Badge tone="green">{roleLabels[user.role]}</Badge>
              </div>
            </div>
            <Link href="/cuenta" className={styles.accountLink}>
              Mi cuenta
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={!online}
              title={online ? undefined : 'Necesitas conexión para cerrar sesión'}
            >
              Salir
            </Button>
          </div>
        </Container>
        <nav aria-label="Principal" className={styles.nav}>
          <Container className={styles.navList}>
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(styles.link, active && styles.active)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </Container>
        </nav>
        <ConnectionBanner />
      </header>
      <main className={styles.main}>
        <Container>{children}</Container>
      </main>
    </div>
  );
}
