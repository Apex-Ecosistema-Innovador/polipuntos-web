'use client';

import { StatusScreen } from '@/components/feedback/status-screen';
import { Button } from '@/components/ui/button';
import '@/styles/globals.scss';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <StatusScreen
          code="500"
          title="Algo salió mal"
          description="La aplicación encontró un error inesperado. Intenta cargarla de nuevo."
          actions={<Button onClick={reset}>Intentar de nuevo</Button>}
        />
      </body>
    </html>
  );
}
