'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerServiceWorker } from '@/lib/offline/service-worker';
import styles from './service-worker-boot.module.scss';

export function ServiceWorkerBoot() {
  const [apply, setApply] = useState<(() => void) | null>(null);

  useEffect(() => {
    void registerServiceWorker((applyUpdate) => setApply(() => applyUpdate)).catch(() => undefined);
  }, []);

  if (!apply) return null;

  return (
    <div className={styles.toast} role="status">
      <span>Hay una versión nueva de la app.</span>
      <Button onClick={apply}>Actualizar</Button>
    </div>
  );
}
