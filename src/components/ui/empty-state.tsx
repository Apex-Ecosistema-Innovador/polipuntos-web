import { ReactNode } from 'react';
import styles from './empty-state.module.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <svg className={styles.mark} viewBox="0 0 64 24" aria-hidden="true">
        <circle cx="6" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 12h20l6-8h14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="58" cy="4" r="3" fill="currentColor" />
      </svg>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
