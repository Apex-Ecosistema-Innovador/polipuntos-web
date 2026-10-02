import { Button } from './button';
import styles from './pagination.module.scss';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span className={styles.status} aria-live="polite">
        {page} / {pages}
      </span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}
