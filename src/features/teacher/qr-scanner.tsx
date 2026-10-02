'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import styles from './award-flow.module.scss';

interface QrScannerProps {
  onToken: (token: string) => void;
}

export function QrScanner({ onToken }: QrScannerProps) {
  return (
    <div className={styles.viewport}>
      <Scanner
        constraints={{ facingMode: 'environment' }}
        onScan={(codes) => {
          const value = codes[0]?.rawValue;
          if (value) onToken(value);
        }}
        formats={['qr_code']}
        components={{ finder: true }}
      />
    </div>
  );
}
