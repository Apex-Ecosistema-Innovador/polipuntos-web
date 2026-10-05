'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { OfflineNotice } from '@/components/feedback/offline-notice';
import { useAuth } from '@/features/auth/auth-context';
import { NetworkError } from '@/lib/api-client';
import { errorMessage, formatCedula, formatDateTime } from '@/lib/format';
import { offlineCache } from '@/lib/offline/cache';
import { polipointService } from '@/lib/services';
import { useConnectivity } from '../offline/connectivity-context';
import styles from './qr-panel.module.scss';

interface Loaded {
  image: string;
  fromDevice: boolean;
  savedAt: string | null;
}

const render = (token: string) =>
  QRCode.toDataURL(token, { errorCorrectionLevel: 'M', margin: 2, width: 480 });

export function QrPanel() {
  const { user } = useAuth();
  const { online } = useConnectivity();
  const userId = user?.id;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsConnection, setNeedsConnection] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    const load = async () => {
      const cached = await offlineCache.qr.get(userId);
      if (cached && active) {
        setLoaded({ image: await render(cached.value), fromDevice: true, savedAt: cached.savedAt });
        setNeedsConnection(false);
      }

      try {
        const token = await polipointService.qr();
        await offlineCache.qr.set(userId, token);
        if (active) {
          setLoaded({ image: await render(token), fromDevice: false, savedAt: null });
          setNeedsConnection(false);
          setError(null);
        }
      } catch (caught) {
        if (!active || cached) return;
        if (caught instanceof NetworkError) setNeedsConnection(true);
        else setError(errorMessage(caught));
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [userId, online]);

  const rotate = async () => {
    if (!userId) return;
    setRotating(true);
    try {
      const token = await polipointService.rotateQr();
      await offlineCache.qr.set(userId, token);
      setLoaded({ image: await render(token), fromDevice: false, savedAt: null });
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setRotating(false);
  };

  if (needsConnection && !loaded) {
    return (
      <OfflineNotice
        title="Conéctate una vez para generar tu QR"
        description="Tu código se guarda en este dispositivo la primera vez. Después podrás mostrarlo sin conexión."
      />
    );
  }
  if (error && !loaded) return <Alert tone="error">{error}</Alert>;
  if (!loaded || !user) return <Spinner label="Generando QR" />;

  return (
    <div className={styles.panel}>
      {error && <Alert tone="error">{error}</Alert>}
      {loaded.fromDevice && !online && (
        <Alert tone="info">
          Sin conexión: mostrando el código guardado en este dispositivo
          {loaded.savedAt ? ` (${formatDateTime(loaded.savedAt)})` : ''}. Sigue siendo válido mientras no lo
          regeneres.
        </Alert>
      )}
      <div className={styles.frame}>
        <Image
          src={loaded.image}
          alt={`Código QR de ${user.fullName}`}
          width={480}
          height={480}
          unoptimized
          className={styles.qr}
        />
      </div>
      <div className={styles.identity}>
        <span className={styles.name}>{user.fullName}</span>
        <span className={styles.cedula}>{formatCedula(user.cedula)}</span>
        {!online && <Badge tone="yellow">Disponible sin conexión</Badge>}
      </div>
      <p className={styles.help}>
        Muestra este código a tu profesor. Si crees que alguien más lo tiene, regéneralo: el anterior dejará
        de funcionar.
      </p>
      <Button variant="secondary" onClick={rotate} loading={rotating} disabled={!online} fullWidthOnMobile>
        Regenerar QR
      </Button>
      {!online && <p className={styles.help}>Para regenerar tu QR necesitas conexión a internet.</p>}
    </div>
  );
}
