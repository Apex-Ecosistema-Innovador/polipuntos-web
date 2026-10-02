import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';
import styles from './field.module.scss';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
}

function FieldShell({ label, hint, error, id, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  mono?: boolean;
}

export function TextField({ label, hint, error, mono, className, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} id={id}>
      <input
        id={id}
        className={cn(styles.control, mono && styles.mono, error && styles.invalid, className)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, error, options, placeholder, className, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} id={id}>
      <select id={id} className={cn(styles.control, styles.select, className)} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
