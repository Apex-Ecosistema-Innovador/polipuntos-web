'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/format';
import { safeNext } from '@/lib/routes';
import { sanitizeCedula } from '@/lib/validation';
import { useAuth } from './auth-context';
import styles from './auth-form.module.scss';

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await signIn(cedula, password);
      router.replace(safeNext(new URLSearchParams(window.location.search).get('next'), user.role));
    } catch (caught) {
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
        autoComplete="username"
        value={cedula}
        onChange={(event) => setCedula(sanitizeCedula(event.target.value))}
        required
      />
      <PasswordField
        label="Contraseña"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
      <Button type="submit" loading={submitting} fullWidthOnMobile>
        Ingresar
      </Button>
    </form>
  );
}
