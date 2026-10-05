'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useConnectivity } from '@/features/offline/connectivity-context';
import styles from './offline-notice.module.scss';

interface OfflineNoticeProps {
  title?: string;
  description: string;
  actions?: ReactNode;
}

export function OfflineNotice({
  title = 'Necesitas conexión a internet',
  description,
  actions,
}: OfflineNoticeProps) {
  const { checking, recheck } = useConnectivity();

  return (
    <section className={styles.notice} aria-live="polite">
      <svg className={styles.mark} viewBox="0 0 96 40" aria-hidden="true">
        <circle cx="10" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 20h22" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M46 14l8 12M54 14l-8 12" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M62 20h14" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
        <circle cx="86" cy="20" r="4" fill="currentColor" />
      </svg>
      <span className={styles.label}>Sin conexión</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className={styles.actions}>
        <Button onClick={() => void recheck()} loading={checking}>
          Reintentar
        </Button>
        {actions}
      </div>
    </section>
  );
}
