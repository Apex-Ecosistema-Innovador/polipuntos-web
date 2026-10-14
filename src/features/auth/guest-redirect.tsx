'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { homeFor, safeNext } from '@/lib/routes';
import { useAuth } from './auth-context';

export function GuestRedirect() {
  const { user, status } = useAuth();
  const router = useRouter();
  const startedAs = useRef(status);

  useEffect(() => {
    if (startedAs.current === 'anonymous' || status !== 'authenticated' || !user) return;
    const next = new URLSearchParams(window.location.search).get('next');
    router.replace(next ? safeNext(next, user.role) : homeFor(user.role));
  }, [status, user, router]);

  return null;
}
