'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/format';
import { homeFor } from '@/lib/routes';
import { institutionalEmailError, institutionalEmailHint } from '@/content/account';
import { authService } from '@/lib/services';
import { useAuth } from './auth-context';
import { fieldErrors } from './use-form-errors';
import styles from './auth-form.module.scss';

export function RegisterTeacherForm() {
  const { completeSession } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ cedula: '', fullName: '', email: '', password: '', inviteCode: '' });
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const emailProblem = institutionalEmailError(form.email);
    if (emailProblem) {
      setErrors({ email: emailProblem });
      return;
    }
    setSubmitting(true);
    setError(null);
    setErrors({});
    try {
      const { payload } = await authService.registerTeacher({
        cedula: form.cedula,
        fullName: form.fullName,
        password: form.password,
        email: form.email,
        inviteCode: form.inviteCode || undefined,
      });
      if (payload.accessToken) {
        completeSession(payload.user, payload.accessToken);
        router.replace(homeFor(payload.user.role));
        return;
      }
      setPending(true);
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  if (pending) {
    return (
      <Alert tone="success">
        Tu cuenta fue creada y está pendiente de aprobación. Cuando un administrador la apruebe podrás
        ingresar.
      </Alert>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField
        label="Cédula"
        mono
        inputMode="numeric"
        value={form.cedula}
        onChange={update('cedula')}
        error={errors.cedula}
        required
      />
      <TextField
        label="Nombre completo"
        autoComplete="name"
        value={form.fullName}
        onChange={update('fullName')}
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
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        value={form.password}
        onChange={update('password')}
        error={errors.password}
        required
      />
      <TextField
        label="Código de invitación (opcional)"
        mono
        hint="Sin código, tu cuenta quedará pendiente de aprobación."
        value={form.inviteCode}
        onChange={update('inviteCode')}
        error={errors.inviteCode}
      />
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Crear cuenta de profesor
      </Button>
    </form>
  );
}
