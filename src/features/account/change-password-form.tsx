'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { passwordMinLength } from '@/content/account';
import { useAuth } from '@/features/auth/auth-context';
import { fieldErrors } from '@/features/auth/use-form-errors';
import { errorMessage } from '@/lib/format';
import { authService } from '@/lib/services';
import styles from './account.module.scss';

const emptyForm = { currentPassword: '', newPassword: '', confirmation: '' };

export function ChangePasswordForm() {
  const { completeSession } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof emptyForm) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setDone(false);
    if (form.newPassword.length < passwordMinLength) {
      setErrors({ newPassword: `Mínimo ${passwordMinLength} caracteres` });
      return;
    }
    if (form.newPassword !== form.confirmation) {
      setErrors({ confirmation: 'Las contraseñas no coinciden' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setError(null);
    try {
      const { payload } = await authService.changePassword(form.currentPassword, form.newPassword);
      completeSession(payload.user, payload.accessToken!);
      setForm(emptyForm);
      setDone(true);
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {done && (
        <Alert tone="success">
          Contraseña actualizada. Cerramos tus otras sesiones; en este dispositivo sigues conectado.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      <PasswordField
        label="Contraseña actual"
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={update('currentPassword')}
        error={errors.currentPassword}
        required
      />
      <PasswordField
        label="Nueva contraseña"
        autoComplete="new-password"
        hint={`Mínimo ${passwordMinLength} caracteres.`}
        value={form.newPassword}
        onChange={update('newPassword')}
        error={errors.newPassword}
        required
      />
      <PasswordField
        label="Confirma la nueva contraseña"
        autoComplete="new-password"
        value={form.confirmation}
        onChange={update('confirmation')}
        error={errors.confirmation}
        required
      />
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Cambiar contraseña
      </Button>
    </form>
  );
}
