import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import styles from './container.module.scss';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  narrow?: boolean;
}

export function Container({ narrow, className, ...rest }: ContainerProps) {
  return <div className={cn(styles.container, narrow && styles.narrow, className)} {...rest} />;
}
