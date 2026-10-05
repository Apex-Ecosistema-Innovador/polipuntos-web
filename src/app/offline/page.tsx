import type { Metadata } from 'next';
import { OfflineScreen } from '@/features/offline/offline-screen';

export const metadata: Metadata = {
  title: 'Sin conexión | Polipuntos APEX',
  robots: { index: false },
};

export default function OfflinePage() {
  return <OfflineScreen />;
}
