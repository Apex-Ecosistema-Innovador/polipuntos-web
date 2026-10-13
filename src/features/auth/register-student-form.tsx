'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/format';
import {
  cedulaError,
  firstError,
  nameError,
  passwordError,
  sanitizeCedula,
  sanitizeName,
} from '@/lib/validation';
import { institutionalEmailError, institutionalEmailHint } from '@/content/account';
import { authService } from '@/lib/services';
import { useAuth } from './auth-context';
import { fieldErrors } from './use-form-errors';
import styles from './auth-form.module.scss';

export function RegisterStudentForm() {
  const { completeSession } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ cedula: '', fullName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof typeof form, clean: (value: string) => string = (value) => value) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: clean(event.target.value) }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const problems = firstError({
      cedula: cedulaError(form.cedula),
      fullName: nameError(form.fullName),
      email: institutionalEmailError(form.email),
      password: passwordError(form.password),
    });
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;
    setSubmitting(true);
    setError(null);
    setErrors({});
    try {
      const { payload } = await authService.registerStudent({
        cedula: form.cedula,
        fullName: form.fullName,
        password: form.password,
        email: form.email,
      });
      completeSession(payload.user, payload.accessToken!);
      router.replace('/estudiante/horario');
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField
        label="Cédula"
        mono
        inputMode="numeric"
        autoComplete="off"
        hint="Es tu identificador único, sin puntos ni espacios."
        value={form.cedula}
        onChange={update('cedula', sanitizeCedula)}
        error={errors.cedula}
        required
      />
      <TextField
        label="Nombre completo"
        autoComplete="name"
        value={form.fullName}
        onChange={update('fullName', sanitizeName)}
        error={errors.fullName}
        required
      />
      <TextField
        label="Correo institucional"
        type="email"
        autoComplete="email"
        hint={`${institutionalEmailHint} Lo usaremos si olvidas tu contraseña.`}
        value={form.email}
        onChange={update('email')}
        error={errors.email}
        required
      />
      <PasswordField
        label="Contraseña"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        value={form.password}
        onChange={update('password')}
        error={errors.password}
        required
      />
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Crear cuenta
      </Button>
    </form>
  );
}
