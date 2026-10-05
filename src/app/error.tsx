'use client';

import { StatusScreen } from '@/components/feedback/status-screen';
import { Button, ButtonLink } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusScreen
      code="500"
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Puedes intentar de nuevo; si persiste, vuelve más tarde."
      actions={
        <>
          <Button onClick={reset}>Intentar de nuevo</Button>
          <ButtonLink href="/" variant="secondary">
            Ir al inicio
          </ButtonLink>
        </>
      }
    />
  );
}
