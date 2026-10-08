import { cn } from '@/lib/cn';
import styles from './switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, onLabel, offLabel, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn(styles.switch, checked && styles.on)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span className={styles.state}>{checked ? onLabel : offLabel}</span>
    </button>
  );
}
