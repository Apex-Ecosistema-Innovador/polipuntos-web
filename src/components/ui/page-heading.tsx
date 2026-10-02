import { ReactNode } from 'react';
import styles from './page-heading.module.scss';

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeading({ eyebrow, title, description, actions }: PageHeadingProps) {
  return (
    <div className={styles.heading}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
