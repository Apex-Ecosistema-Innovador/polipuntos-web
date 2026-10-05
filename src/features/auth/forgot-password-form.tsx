'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { institutionalEmailError, institutionalEmailHint } from '@/content/account';
import { errorMessage } from '@/lib/format';
import { authService } from '@/lib/services';
import styles from './auth-form.module.scss';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = institutionalEmailError(email);
    setFieldError(problem);
    if (problem) return;

    setSubmitting(true);
    setError(null);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className={styles.form}>
        <Alert tone="success">
          Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa tu
          bandeja de entrada y la carpeta de spam. El enlace vence en 60 minutos.
        </Alert>
        <Link href="/login">Volver a ingresar</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField
        label="Correo institucional"
        type="email"
        autoComplete="email"
        hint={institutionalEmailHint}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldError}
        required
      />
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Enviar enlace
      </Button>
    </form>
  );
}
