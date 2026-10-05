'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/format';
import { homeFor } from '@/lib/routes';
import { institutionalEmailError, institutionalEmailHint } from '@/content/account';
import { authService, offeringService } from '@/lib/services';
import { OfferingPicker } from '../student/offering-picker';
import { useAuth } from './auth-context';
import { fieldErrors } from './use-form-errors';
import styles from './auth-form.module.scss';

export function RegisterStudentForm() {
  const { completeSession } = useAuth();
  const router = useRouter();
  const offerings = useQuery(() => offeringService.listPublic(), []);
  const [form, setForm] = useState({ cedula: '', fullName: '', email: '', password: '' });
  const [offeringIds, setOfferingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const toggleOffering = (id: string) =>
    setOfferingIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

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
      const { payload } = await authService.registerStudent({
        cedula: form.cedula,
        fullName: form.fullName,
        password: form.password,
        email: form.email,
        offeringIds,
      });
      completeSession(payload.user, payload.accessToken!);
      router.replace(homeFor(payload.user.role));
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField
        label="Cédula"
        mono
        inputMode="numeric"
        hint="Es tu identificador único, sin puntos ni espacios."
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
      <h2 className="visually-hidden">Asignaturas</h2>
      {offerings.loading && <Spinner />}
      {offerings.data && (
        <OfferingPicker
          offerings={offerings.data}
          selectedIds={offeringIds}
          onToggle={toggleOffering}
          actionLabel={(selected) => (selected ? 'Inscrito' : 'Inscribirme')}
        />
      )}
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Crear cuenta
      </Button>
    </form>
  );
}
