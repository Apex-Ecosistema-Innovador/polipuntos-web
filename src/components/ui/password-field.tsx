'use client';

import { InputHTMLAttributes, useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { FieldShell } from './text-field';
import styles from './field.module.scss';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  error?: string;
}

export function PasswordField({ label, hint, error, className, ...rest }: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell label={label} hint={hint} error={error} id={id}>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(styles.control, styles.passwordControl, error && styles.invalid, className)}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M4 20 20 4" />}
          </svg>
        </button>
      </div>
    </FieldShell>
  );
}
