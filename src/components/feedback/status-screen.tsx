import { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Wordmark } from '@/components/layout/wordmark';
import { NodeBackdrop } from '@/components/visuals/node-backdrop';
import styles from './status-screen.module.scss';

interface StatusScreenProps {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function StatusScreen({ code, title, description, actions }: StatusScreenProps) {
  return (
    <div className={styles.page}>
      <NodeBackdrop />
      <Container className={styles.content}>
        <Wordmark />
        <main className={styles.main}>
          <span className={styles.code}>{code}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {actions && <div className={styles.actions}>{actions}</div>}
        </main>
      </Container>
    </div>
  );
}
