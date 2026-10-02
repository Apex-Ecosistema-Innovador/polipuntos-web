import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import styles from './badge.module.scss';

type Tone = 'neutral' | 'green' | 'yellow' | 'purple' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span className={cn(styles.badge, styles[tone], className)} {...rest} />;
}
