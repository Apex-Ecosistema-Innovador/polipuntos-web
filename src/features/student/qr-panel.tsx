'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-context';
import { errorMessage, formatCedula } from '@/lib/format';
import { polipointService } from '@/lib/services';
import styles from './qr-panel.module.scss';

export function QrPanel() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  const render = useCallback(async (token: string) => {
    setImage(await QRCode.toDataURL(token, { errorCorrectionLevel: 'M', margin: 2, width: 480 }));
  }, []);

  useEffect(() => {
    polipointService
      .qr()
      .then(render)
      .catch((caught) => setError(errorMessage(caught)));
  }, [render]);

  const rotate = async () => {
    setRotating(true);
    try {
      await render(await polipointService.rotateQr());
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setRotating(false);
  };

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!image || !user) return <Spinner label="Generando QR" />;

  return (
    <div className={styles.panel}>
      <div className={styles.frame}>
        <Image
          src={image}
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
      </div>
      <p className={styles.help}>
        Muestra este código a tu profesor. Si crees que alguien más lo tiene, regéneralo: el anterior dejará
        de funcionar.
      </p>
      <Button variant="secondary" onClick={rotate} loading={rotating} fullWidthOnMobile>
        Regenerar QR
      </Button>
    </div>
  );
}
