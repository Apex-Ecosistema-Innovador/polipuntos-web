'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { homeFor } from '@/lib/routes';
import { Role } from '@/types/api';
import { Spinner } from '../ui/spinner';
import { Container } from './container';

interface RoleGuardProps {
  roles: Role[];
  children: ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, status, signedOutByUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = Boolean(user && roles.includes(user.role));

  useEffect(() => {
    if (status === 'anonymous') {
      window.location.replace(signedOutByUser ? '/login' : `/login?next=${encodeURIComponent(pathname)}`);
    }
    if (status === 'authenticated' && user && !allowed) router.replace(homeFor(user.role));
  }, [status, user, allowed, router, pathname, signedOutByUser]);

  if (!allowed) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  return <>{children}</>;
}
