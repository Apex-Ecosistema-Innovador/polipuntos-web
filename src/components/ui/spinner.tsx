import styles from './spinner.module.scss';

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.bar} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
