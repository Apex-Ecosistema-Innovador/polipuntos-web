import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import styles from './card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  tone?: 'default' | 'principal';
}

export function Card({ interactive, tone = 'default', className, ...rest }: CardProps) {
  return (
    <div className={cn(styles.card, styles[tone], interactive && styles.interactive, className)} {...rest} />
  );
}
