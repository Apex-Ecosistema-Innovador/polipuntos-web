import { ReactNode } from 'react';
import { Wordmark } from './wordmark';
import { Container } from './container';
import { NodeBackdrop } from '../visuals/node-backdrop';
import styles from './auth-layout.module.scss';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <NodeBackdrop />
      <Container narrow className={styles.content}>
        <Wordmark />
        <main className={styles.main}>
          <header className={styles.header}>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </header>
          {children}
        </main>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </Container>
    </div>
  );
}
