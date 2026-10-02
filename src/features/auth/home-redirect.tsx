'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { homeFor } from '@/lib/routes';
import { useAuth } from './auth-context';

export function HomeRedirect() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && user) router.replace(homeFor(user.role));
  }, [status, user, router]);

  return null;
}
