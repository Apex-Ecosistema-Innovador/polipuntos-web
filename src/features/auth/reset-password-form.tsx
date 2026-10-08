'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PasswordField } from '@/components/ui/password-field';
import { passwordMinLength } from '@/content/account';
import { errorMessage } from '@/lib/format';
import { authService } from '@/lib/services';
import { fieldErrors } from './use-form-errors';
import styles from './auth-form.module.scss';

const TOKEN_PATTERN = /[#&]token=([\w-]+)/;

export function ResetPasswordForm() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToken(TOKEN_PATTERN.exec(window.location.hash)?.[1] ?? null);
      window.history.replaceState(null, '', window.location.pathname);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < passwordMinLength) {
      setErrors({ password: `Mínimo ${passwordMinLength} caracteres` });
      return;
    }
    if (password !== confirmation) {
      setErrors({ confirmation: 'Las contraseñas no coinciden' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setError(null);
    try {
      await authService.resetPassword(token!, password);
      setDone(true);
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  if (token === undefined) return <Spinner />;

  if (!token) {
    return (
      <div className={styles.form}>
        <Alert tone="error">El enlace no es válido. Solicita uno nuevo para restablecer tu contraseña.</Alert>
        <ButtonLink href="/recuperar-contrasena">Solicitar enlace</ButtonLink>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.form}>
        <Alert tone="success">Tu contraseña fue actualizada. Ya puedes iniciar sesión.</Alert>
        <ButtonLink href="/login">Ingresar</ButtonLink>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert tone="error">
          {error} <Link href="/recuperar-contrasena">Solicitar un nuevo enlace</Link>
        </Alert>
      )}
      <PasswordField
        label="Nueva contraseña"
        autoComplete="new-password"
        hint={`Mínimo ${passwordMinLength} caracteres.`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        required
      />
      <PasswordField
        label="Confirma la contraseña"
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        error={errors.confirmation}
        required
      />
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Guardar contraseña
      </Button>
    </form>
  );
}
