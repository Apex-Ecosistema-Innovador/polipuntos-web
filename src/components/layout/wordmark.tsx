import Link from 'next/link';
import styles from './wordmark.module.scss';

export function Wordmark({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className={styles.wordmark} aria-label="APEX Polipuntos, inicio">
      <span className={styles.name}>APEX</span>
      <span className={styles.product}>polipuntos</span>
    </Link>
  );
}
