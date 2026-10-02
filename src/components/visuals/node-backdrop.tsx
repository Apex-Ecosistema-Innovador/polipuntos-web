import styles from './node-backdrop.module.scss';

export function NodeBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.atmosphere} />
      <svg className={styles.circuit} viewBox="0 0 400 160" preserveAspectRatio="xMinYMin slice">
        <path d="M10 30h110l30 30h120" fill="none" stroke="var(--brand-green-pine)" strokeWidth="1.5" />
        <path d="M10 90h60l20 20h150" fill="none" stroke="var(--brand-purple)" strokeWidth="1.5" />
        <circle cx="10" cy="30" r="4" fill="var(--brand-green-light)" />
        <circle cx="270" cy="60" r="4" fill="none" stroke="var(--brand-green-light)" strokeWidth="1.5" />
        <circle cx="240" cy="110" r="3" fill="var(--brand-purple)" />
        <circle cx="10" cy="90" r="3" fill="none" stroke="var(--brand-purple)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
