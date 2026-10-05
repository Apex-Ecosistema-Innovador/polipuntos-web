'use client';

import { ButtonLink } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { homeFor } from '@/lib/routes';

export function SessionActions() {
  const { user, status } = useAuth();

  if (status === 'loading') return null;

  if (user) {
    return (
      <>
        <ButtonLink href={homeFor(user.role)}>Ir a mi panel</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Ir al inicio
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <ButtonLink href="/login">Iniciar sesión</ButtonLink>
      <ButtonLink href="/" variant="secondary">
        Ir al inicio
      </ButtonLink>
    </>
  );
}
