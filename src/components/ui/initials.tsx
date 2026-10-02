import { initialsOf } from '@/lib/format';
import { cn } from '@/lib/cn';
import styles from './initials.module.scss';

interface InitialsProps {
  name: string;
  size?: 'sm' | 'lg';
}

export function Initials({ name, size = 'sm' }: InitialsProps) {
  return (
    <span className={cn(styles.initials, styles[size])} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}
