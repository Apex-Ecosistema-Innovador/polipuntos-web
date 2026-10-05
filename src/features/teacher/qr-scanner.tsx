'use client';

import { Scanner, setZXingModuleOverrides } from '@yudiel/react-qr-scanner';
import { scannerWasmUrl } from '@/lib/offline/warm-targets';
import styles from './award-flow.module.scss';

setZXingModuleOverrides({
  locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? scannerWasmUrl : prefix + path),
});

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
          if (!value) return;
          navigator.vibrate?.(80);
          onToken(value);
        }}
        sound={false}
        formats={['qr_code']}
        components={{ finder: true }}
      />
    </div>
  );
}
