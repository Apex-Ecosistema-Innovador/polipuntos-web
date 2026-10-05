'use client';

import { ReactNode } from 'react';
import { useConnectivity } from '@/features/offline/connectivity-context';
import { OfflineNotice } from './offline-notice';

interface RequiresConnectionProps {
  feature: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function RequiresConnection({ feature, actions, children }: RequiresConnectionProps) {
  const { online } = useConnectivity();

  if (online) return <>{children}</>;

  return (
    <OfflineNotice
      description={`${feature} solo está disponible con conexión. Conéctate a la red y se mostrará automáticamente.`}
      actions={actions}
    />
  );
}
