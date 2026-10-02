import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './alert.module.scss';

interface AlertProps {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
}

export function Alert({ tone = 'info', children }: AlertProps) {
  return (
    <div className={cn(styles.alert, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
