import Image from 'next/image';
import Link from 'next/link';
import styles from './wordmark.module.scss';

export function Wordmark({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className={styles.wordmark} aria-label="APEX Polipuntos, inicio">
      <Image src="/brand/apex-symbol.png" alt="" width={28} height={28} className={styles.symbol} priority />
      <span className={styles.name}>APEX</span>
      <span className={styles.product}>polipuntos</span>
    </Link>
  );
}
