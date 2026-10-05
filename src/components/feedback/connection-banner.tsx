'use client';

import { useConnectivity } from '@/features/offline/connectivity-context';
import styles from './connection-banner.module.scss';

export function ConnectionBanner() {
  const { online } = useConnectivity();

  if (online) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <span>Sin conexión. Puedes seguir usando el QR y el escáner; lo demás requiere internet.</span>
    </div>
  );
}
