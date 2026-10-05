import type { Metadata } from 'next';
import { StatusScreen } from '@/components/feedback/status-screen';
import { SessionActions } from '@/components/feedback/session-actions';

export const metadata: Metadata = { title: 'Página no encontrada | Polipuntos APEX' };

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Esta página no existe"
      description="La dirección que buscas no está disponible o fue movida. Vuelve a tu panel o al inicio."
      actions={<SessionActions />}
    />
  );
}
