'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OfflineNotice } from '@/components/feedback/offline-notice';
import { Container } from '@/components/layout/container';
import { Wordmark } from '@/components/layout/wordmark';
import { ButtonLink } from '@/components/ui/button';
import { offlineCache } from '@/lib/offline/cache';
import { Role } from '@/types/api';
import { useConnectivity } from './connectivity-context';
import styles from './offline-screen.module.scss';

const returnTarget = () => {
  const from = new URLSearchParams(window.location.search).get('from');
  return from && from.startsWith('/') && !from.startsWith('//') ? from : '/';
};

export function OfflineScreen() {
  const { online, known } = useConnectivity();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    void offlineCache.session.get().then((cached) => setRole(cached?.value.role ?? null));
  }, []);

  useEffect(() => {
    if (known && online) router.replace(returnTarget());
  }, [known, online, router]);

  return (
    <Container className={styles.page}>
      <Wordmark />
      <div className={styles.body}>
        <OfflineNotice
          title="Esta página no está disponible sin conexión"
          description="Aún no se guardó en este dispositivo. Cuando recuperes internet volverás automáticamente a ella."
          actions={
            <>
              {role === 'student' && <ButtonLink href="/estudiante/qr">Mostrar mi QR</ButtonLink>}
              {role === 'teacher' && (
                <>
                  <ButtonLink href="/profesor/escanear">Escanear estudiante</ButtonLink>
                  <ButtonLink href="/profesor/pendientes" variant="secondary">
                    Ver pendientes
                  </ButtonLink>
                </>
              )}
            </>
          }
        />
      </div>
    </Container>
  );
}
